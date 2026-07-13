// ============================================================
// Server-side account context — for API routes and server
// components. Reads the caller's profile + account in one round
// trip and verifies role on demand.
//
// IMPORTANT: this module is server-only. It imports the Supabase
// SSR client (`@/lib/supabase/server`), which reads `next/headers`
// cookies. Importing it from a client component will fail at
// build time with the standard Next.js "You're importing a
// component that needs `next/headers`" error — that's the
// boundary check; we don't need the `server-only` package.
//
// Calling convention
// ------------------
// API routes don't need to redo `supabase.auth.getUser()` — they
// receive a fully-loaded context from `requireRole`:
//
//   try {
//     const ctx = await requireRole("admin");
//     // ctx.supabase — the SSR client (RLS scoped to this user)
//     // ctx.userId  — auth.uid()
//     // ctx.accountId / ctx.role / ctx.account
//   } catch (err) {
//     return errorResponse(err); // see toErrorResponse() below
//   }
// ============================================================

import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";
import { hasMinRole, isAccountRole, type AccountRole } from "./roles";
import {
  type FeatureKey,
  getSubscriptionTier,
  hasFeature,
  getMinimumPlanForFeature,
} from "./features";

// Re-export requireWriteAccess here so API routes have a single import point.
export { requireWriteAccess, requirePermission, hasPermission } from "./permissions";

// ------------------------------------------------------------
// Errors
//
// Custom classes so API routes can map a single `catch` to the
// right HTTP status without sprinkling 401/403 strings everywhere.
// ------------------------------------------------------------

export class UnauthorizedError extends Error {
  readonly status = 401 as const;
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends Error {
  readonly status = 403 as const;
  constructor(message = "Forbidden") {
    super(message);
    this.name = "ForbiddenError";
  }
}

/**
 * Convert one of the typed errors above (or anything else) into a
 * `NextResponse`. Routes can do:
 *
 *   } catch (err) {
 *     return toErrorResponse(err);
 *   }
 *
 * Unknown errors collapse to 500 with the generic message — we
 * never leak `err.message` for non-classified errors to keep
 * server internals out of the wire.
 */
export function toErrorResponse(err: unknown): NextResponse {
  if (err instanceof UnauthorizedError || err instanceof ForbiddenError) {
    return NextResponse.json({ error: err.message }, { status: err.status });
  }
  console.error("[toErrorResponse] uncategorized error:", err);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}

// ------------------------------------------------------------
// Account context
// ------------------------------------------------------------

export interface AccountContext {
  /** Supabase SSR client, RLS scoped to the calling user. */
  supabase: SupabaseClient;
  /** `auth.uid()` for the caller. Always defined when this resolves. */
  userId: string;
  /** Caller's account_id from their profile row. */
  accountId: string;
  /** Caller's role within their account. */
  role: AccountRole;
  /** Lightweight account meta — id + name. */
  account: { id: string; name: string };
  /** Whether the user is a platform-wide super admin. */
  isSuperAdmin: boolean;
  /**
   * Current subscription status of the account.
   * State machine: trial → active | expired
   *                active → past_due → active | expired
   *                any    → cancelled (owner cancels)
   * expired / cancelled = read-only; all writes are blocked.
   */
  subscriptionStatus:
    | "trial"
    | "active"
    | "past_due"
    | "expired"
    | "cancelled"
    | "inactive"; // legacy — treated as expired
  /** Current subscription plan, e.g. "basic", "pro_monthly", "premium_yearly" */
  subscriptionPlan: string;
  /**
   * ISO timestamp when the trial ends. Only set for trial accounts.
   * Use to render the trial countdown banner.
   */
  trialEndsAt: string | null;
}

/**
 * Resolve the caller's user + account + role in one round trip.
 *
 * Throws `UnauthorizedError` if there's no Supabase session.
 * Throws `ForbiddenError` if the profile is missing account
 * fields (shouldn't happen post-017 migration; defensive guard
 * against profile rows that pre-date the backfill or were
 * inserted by hand).
 *
 * Use `requireRole(min)` instead when the route also needs a
 * minimum-role check — it's a thin wrapper over this.
 */
export async function getCurrentAccount(): Promise<AccountContext> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();
  if (userErr || !user) {
    throw new UnauthorizedError();
  }

  // Safely check if the user is a super admin first.
  let isSuperAdmin = false;
  try {
    const { data: adminData, error: adminErr } = await supabase
      .from("profiles")
      .select("is_super_admin")
      .eq("user_id", user.id)
      .maybeSingle();
    if (!adminErr && adminData?.is_super_admin) {
      isSuperAdmin = true;
    }
  } catch {
    // Column doesn't exist yet
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("account_id, account_role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("[getCurrentAccount] profile fetch error:", error);
    throw new ForbiddenError("Could not load account context");
  }
  
  if (!data || !data.account_id || !data.account_role) {
    if (isSuperAdmin) {
      return {
        supabase,
        userId: user.id,
        accountId: "super-admin",
        role: "owner" as AccountRole,
        account: { id: "super-admin", name: "Super Admin" },
        isSuperAdmin: true,
        subscriptionStatus: "active",
        subscriptionPlan: "premium",
        trialEndsAt: null,
      };
    }
    throw new ForbiddenError("Profile is not linked to an account");
  }
  if (!isAccountRole(data.account_role)) {
    throw new ForbiddenError(`Unknown account role: ${data.account_role}`);
  }

  // Fetch account using only stable columns (always exist post-017).
  // trial_ends_at is fetched separately below so the code degrades
  // gracefully until migration 040 is applied to the database.
  const { data: account, error: accountErr } = await supabase
    .from("accounts")
    .select("id, name, subscription_status, subscription_plan")
    .eq("id", data.account_id)
    .maybeSingle();

  if (accountErr) {
    console.error("[getCurrentAccount] account fetch error:", accountErr);
    throw new ForbiddenError("Could not load account context");
  }
  if (!account) {
    if (isSuperAdmin) {
      return {
        supabase,
        userId: user.id,
        accountId: "super-admin",
        role: "owner" as AccountRole,
        account: { id: "super-admin", name: "Super Admin" },
        isSuperAdmin: true,
        subscriptionStatus: "active",
        subscriptionPlan: "premium",
        trialEndsAt: null,
      };
    }
    throw new ForbiddenError("Profile is not linked to an account");
  }

  // Fetch trial_ends_at separately — column only exists after migration 040.
  // If not yet migrated, this silently returns null (no breakage).
  let trialEndsAt: string | null = null;
  try {
    const { data: trialData } = await supabase
      .from("accounts")
      .select("trial_ends_at")
      .eq("id", data.account_id)
      .maybeSingle();
    trialEndsAt = trialData?.trial_ends_at ?? null;
  } catch {
    // Column doesn't exist yet (pre-040 schema) — treat as null.
  }

  return {
    supabase,
    userId: user.id,
    accountId: data.account_id,
    role: data.account_role,
    account: { id: account.id, name: account.name },
    isSuperAdmin,
    subscriptionStatus: account.subscription_status ?? "trial",
    subscriptionPlan: account.subscription_plan ?? "basic",
    trialEndsAt,
  };
}

/**
 * Resolve the caller's account context and enforce a minimum role.
 *
 * Throws `UnauthorizedError` / `ForbiddenError` as documented on
 * `getCurrentAccount`, plus `ForbiddenError("Insufficient role")`
 * when the caller is below `min`.
 */
export async function requireRole(min: AccountRole): Promise<AccountContext> {
  const ctx = await getCurrentAccount();
  
  // Super admins bypass all role and subscription checks
  if (ctx.isSuperAdmin) {
    return ctx;
  }


  if (!hasMinRole(ctx.role, min)) {
    throw new ForbiddenError(
      `This action requires the '${min}' role or higher`,
    );
  }
  return ctx;
}

/**
 * Validates that the current account has access to a specific feature.
 * Throws a ForbiddenError if the feature is not included in their tier.
 * Super admins always bypass this check.
 *
 * SERVER-ONLY: This function calls getCurrentAccount() which uses next/headers.
 * Import from '@/lib/auth/account', not '@/lib/auth/features'.
 */
export async function requireFeature(feature: FeatureKey): Promise<void> {
  const ctx = await getCurrentAccount();

  if (ctx.isSuperAdmin) {
    return;
  }

  const tier = getSubscriptionTier(ctx.subscriptionPlan);

  if (!hasFeature(tier, feature)) {
    const minPlan = getMinimumPlanForFeature(feature);
    throw new ForbiddenError(
      `Feature '${feature}' is not available on your current plan (${tier.toUpperCase()}). Please upgrade to the ${minPlan} plan.`
    );
  }
}


/**
 * Gets the current account context specifically for the admin portal.
 * This reads the `sb-admin-auth-token` cookie via `createAdminClient()`.
 * Throws if the user is not a super admin.
 */
export async function getAdminAccount(): Promise<AccountContext> {
  const { createAdminClient } = await import("@/lib/supabase/server");
  const supabase = await createAdminClient();

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();
  if (userErr || !user) {
    throw new UnauthorizedError();
  }

  // Verify they are a super admin
  const { data: profile, error: profileErr } = await supabase
    .from("profiles")
    .select("is_super_admin, account_id, account_role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profileErr || !profile?.is_super_admin) {
    throw new ForbiddenError("Super admin privileges required.");
  }

  const accountId = profile.account_id;
  const role = profile.account_role as AccountRole;

  if (!accountId) {
    throw new ForbiddenError("Your profile is not linked to any workspace.");
  }

  const { data: accData, error: accErr } = await supabase
    .from("accounts")
    .select("name, subscription_status, subscription_plan")
    .eq("id", accountId)
    .maybeSingle();

  if (accErr || !accData) {
    throw new ForbiddenError("Workspace not found.");
  }

  // Fetch trial_ends_at separately — graceful fallback if column not yet migrated.
  let adminTrialEndsAt: string | null = null;
  try {
    const { data: tData } = await supabase
      .from("accounts")
      .select("trial_ends_at")
      .eq("id", accountId)
      .maybeSingle();
    adminTrialEndsAt = tData?.trial_ends_at ?? null;
  } catch {
    // Pre-040 schema — column doesn't exist yet.
  }

  return {
    supabase,
    userId: user.id,
    accountId,
    role,
    account: { id: accountId, name: accData.name },
    subscriptionStatus: accData.subscription_status,
    subscriptionPlan: accData.subscription_plan,
    trialEndsAt: adminTrialEndsAt,
    isSuperAdmin: true,
  };
}
