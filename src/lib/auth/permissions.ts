// ============================================================
// permissions.ts — Unified server-side permission helper
//
// Single source of truth for the roles × actions matrix.
// NEVER trust frontend role checks alone; always call
// hasPermission() (or requirePermission()) in API routes.
//
// Matrix (from spec):
//
//   Action                   SuperAdmin  Owner   Manager  Agent
//   ─────────────────────────────────────────────────────────────
//   view_all_tenants            ✓          ✗        ✗       ✗
//   manage_plans_pricing        ✓          ✗        ✗       ✗
//   suspend_any_tenant          ✓          ✗        ✗       ✗
//   manage_billing              ✗          ✓        ✗       ✗
//   invite_team                 ✗          ✓        ✓*      ✗
//   remove_team                 ✗          ✓        ✓*      ✗
//   send_messages               ✗          ✓        ✓       ✓
//   create_campaigns            ✗          ✓        ✓       ✗
//   edit_flows                  ✗          ✓        ✓       ✗
//   view_analytics              ✗          ✓        ✓       ✗†
//   delete_contacts             ✗          ✓        ✓       ✗
//   create_flow                 ✗          ✓        ✓       ✗
//
//   * Manager can invite/remove agents ONLY (not other admins/owners)
//   † Agent can only view analytics for their own assigned chats
//
// "Manager" = the DB role "admin" (named differently in the UI
// to reduce confusion with "Super Admin").
// ============================================================

import { ForbiddenError } from "./account";
import { hasMinRole, type AccountRole } from "./roles";

// ---------------------------------------------------------------------------
// Action catalogue
// ---------------------------------------------------------------------------

export type Permission =
  // Super Admin only
  | "view_all_tenants"
  | "manage_plans_pricing"
  | "suspend_any_tenant"
  // Owner only
  | "manage_billing"
  // Owner + Manager (admin+)
  | "invite_team"
  | "remove_team"
  | "edit_flows"
  | "create_campaigns"
  | "view_analytics"
  | "delete_contacts"
  | "create_flow"
  | "edit_account_settings"
  // Agent+ (owner + manager + agent)
  | "send_messages"
  | "view_contacts"
  | "view_conversations"
  // Invite role constraints (used with extra.targetRole)
  | "invite_as_admin"   // only owner can offer admin role
  | "invite_as_agent";  // owner + manager

export interface PermissionContext {
  isSuperAdmin: boolean;
  role: AccountRole;
  subscriptionStatus: string;
}

// ---------------------------------------------------------------------------
// Core check — pure, no I/O, unit-testable
// ---------------------------------------------------------------------------

/**
 * Returns true iff the caller identified by `ctx` has the given `permission`.
 *
 * For `invite_team` and `remove_team`, pass `extra.targetRole` (the role
 * being invited / removed) to enforce the manager-can-invite-agents-only rule.
 */
export function hasPermission(
  ctx: PermissionContext,
  permission: Permission,
  extra?: { targetRole?: AccountRole }
): boolean {
  const { isSuperAdmin, role } = ctx;

  // ── Super Admin exclusive ─────────────────────────────────────────────────
  if (
    permission === "view_all_tenants" ||
    permission === "manage_plans_pricing" ||
    permission === "suspend_any_tenant"
  ) {
    return isSuperAdmin;
  }

  // Super admins bypass all other checks (can see/do everything a tenant can)
  if (isSuperAdmin) return true;

  // ── Subscription write-guard ─────────────────────────────────────────────
  // Read-only actions are allowed in expired/cancelled states.
  // Write actions require an active subscription.
  const isReadOnly =
    ctx.subscriptionStatus === "expired" ||
    ctx.subscriptionStatus === "cancelled";

  const WRITE_ACTIONS: Permission[] = [
    "invite_team",
    "remove_team",
    "send_messages",
    "create_campaigns",
    "edit_flows",
    "delete_contacts",
    "create_flow",
    "edit_account_settings",
    "invite_as_admin",
    "invite_as_agent",
  ];

  if (isReadOnly && WRITE_ACTIONS.includes(permission)) {
    return false;
  }

  // ── Owner-only ────────────────────────────────────────────────────────────
  if (permission === "manage_billing") {
    return role === "owner";
  }

  // ── Owner + Manager (admin+) ──────────────────────────────────────────────
  if (
    permission === "edit_flows" ||
    permission === "create_campaigns" ||
    permission === "view_analytics" ||
    permission === "delete_contacts" ||
    permission === "create_flow" ||
    permission === "edit_account_settings"
  ) {
    return hasMinRole(role, "admin");
  }

  // ── Invite / remove with role-level restriction ───────────────────────────
  if (permission === "invite_team" || permission === "remove_team") {
    if (!hasMinRole(role, "admin")) return false;

    const targetRole = extra?.targetRole;
    if (!targetRole) return hasMinRole(role, "admin"); // no target = just check admin+

    // Owner can invite anyone except another owner
    if (role === "owner") return targetRole !== "owner";

    // Manager (admin) can only invite/remove agents
    return targetRole === "agent";
  }

  if (permission === "invite_as_admin") {
    // Only owner can offer the admin/manager role
    return role === "owner";
  }

  if (permission === "invite_as_agent") {
    return hasMinRole(role, "admin");
  }

  // ── Agent+ ────────────────────────────────────────────────────────────────
  if (
    permission === "send_messages" ||
    permission === "view_contacts" ||
    permission === "view_conversations"
  ) {
    return hasMinRole(role, "agent");
  }

  return false;
}

// ---------------------------------------------------------------------------
// Throwing variant — for use in API routes
// ---------------------------------------------------------------------------

/**
 * Throws `ForbiddenError` if the caller does NOT have `permission`.
 * Use in API routes:
 *
 *   await requirePermission(ctx, 'create_campaigns')
 */
export function requirePermission(
  ctx: PermissionContext,
  permission: Permission,
  extra?: { targetRole?: AccountRole }
): void {
  if (!hasPermission(ctx, permission, extra)) {
    throw new ForbiddenError(
      permissionErrorMessage(permission, extra?.targetRole)
    );
  }
}

// ---------------------------------------------------------------------------
// Read-only mode guard
// ---------------------------------------------------------------------------

/**
 * Throws ForbiddenError when the account is in expired or cancelled state.
 * Call this at the top of any write API route as a blanket guard.
 */
export function requireWriteAccess(ctx: PermissionContext): void {
  if (
    ctx.subscriptionStatus === "expired" ||
    ctx.subscriptionStatus === "cancelled"
  ) {
    const isExpired = ctx.subscriptionStatus === "expired";
    throw new ForbiddenError(
      isExpired
        ? "Your subscription has expired. Reactivate your plan to continue."
        : "Your account is cancelled (read-only). Reactivate to make changes."
    );
  }
}

// ---------------------------------------------------------------------------
// Error message helper
// ---------------------------------------------------------------------------

function permissionErrorMessage(
  permission: Permission,
  targetRole?: AccountRole
): string {
  switch (permission) {
    case "view_all_tenants":
    case "manage_plans_pricing":
    case "suspend_any_tenant":
      return "Super Admin access required.";
    case "manage_billing":
      return "Only the account owner can manage billing.";
    case "invite_team":
    case "invite_as_agent":
      if (targetRole && targetRole !== "agent") {
        return "Managers can only invite team members with the Agent role. Ask the Owner to invite a Manager.";
      }
      return "You do not have permission to invite team members.";
    case "invite_as_admin":
      return "Only the Owner can invite Managers. Ask the account owner.";
    case "remove_team":
      return "You do not have permission to remove team members.";
    case "send_messages":
      return "You need at least the Agent role to send messages.";
    case "create_campaigns":
      return "Creating campaigns requires the Manager role or higher.";
    case "edit_flows":
    case "create_flow":
      return "Editing chatbot flows requires the Manager role or higher.";
    case "view_analytics":
      return "Viewing analytics requires the Manager role or higher.";
    case "delete_contacts":
      return "Deleting contacts requires the Manager role or higher.";
    case "edit_account_settings":
      return "Editing account settings requires the Manager role or higher.";
    default:
      return "You do not have permission to perform this action.";
  }
}
