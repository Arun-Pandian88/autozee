import { NextResponse } from "next/server";
import { getAdminAccount } from "@/lib/auth/account";
import { supabaseAdmin } from "@/lib/flows/admin-client";

const VALID_STATUSES = [
  "trial",
  "active",
  "past_due",
  "expired",
  "cancelled",
  "inactive", // legacy
] as const;

const VALID_PLANS = [
  "basic", "basic_monthly", "basic_yearly",
  "pro",   "pro_monthly",   "pro_yearly",
  "premium","premium_monthly","premium_yearly",
] as const;

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  // Must be super admin
  const ctx = await getAdminAccount().catch(() => null);
  if (!ctx?.isSuperAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await context.params;
  const body = await request.json();

  const {
    subscription_status,
    subscription_plan,
    subscription_start_at,
    subscription_end_at,
    subscription_source = "manual",
    subscription_notes,
    grace_period_days,
  } = body;

  // Validate status value if provided
  if (
    subscription_status !== undefined &&
    !VALID_STATUSES.includes(subscription_status)
  ) {
    return NextResponse.json(
      {
        error: `Invalid subscription_status. Must be one of: ${VALID_STATUSES.join(", ")}`,
      },
      { status: 400 }
    );
  }

  // Validate plan value if provided
  if (
    subscription_plan !== undefined &&
    !VALID_PLANS.includes(subscription_plan)
  ) {
    return NextResponse.json(
      {
        error: `Invalid subscription_plan. Must be one of: ${VALID_PLANS.join(", ")}`,
      },
      { status: 400 }
    );
  }

  const admin = supabaseAdmin();

  // Build patch — only include defined fields
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (subscription_status !== undefined) patch.subscription_status = subscription_status;
  if (subscription_plan !== undefined)   patch.subscription_plan = subscription_plan;
  if (subscription_start_at !== undefined) patch.subscription_start_at = subscription_start_at;
  if (subscription_end_at !== undefined)   patch.subscription_end_at = subscription_end_at;
  if (subscription_source !== undefined)   patch.subscription_source = subscription_source;
  if (subscription_notes !== undefined)    patch.subscription_notes = subscription_notes;
  if (grace_period_days !== undefined)     patch.grace_period_days = grace_period_days;

  // Auto-set start date when activating
  if (subscription_status === "active" && !subscription_start_at) {
    patch.subscription_start_at = new Date().toISOString();
  }

  // When setting past_due, auto-stamp grace_ends_at
  if (subscription_status === "past_due") {
    const graceDays =
      typeof grace_period_days === "number" ? grace_period_days : 3;
    const graceEnd = new Date();
    graceEnd.setDate(graceEnd.getDate() + graceDays);
    patch.grace_ends_at = graceEnd.toISOString();
  }

  // When cancelling, stamp cancelled_at and data_retention_until
  if (subscription_status === "cancelled") {
    const now = new Date();
    patch.cancelled_at = now.toISOString();
    const retention = new Date(now);
    retention.setDate(retention.getDate() + 30);
    patch.data_retention_until = retention.toISOString();
  }

  const { error } = await admin
    .from("accounts")
    .update(patch)
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // ── Audit log ──────────────────────────────────────────────────────────────
  // Log every Super Admin mutation on tenant subscription data.
  // Failures are non-fatal (don't block the response) but always logged.
  const action = subscription_status
    ? `subscription_status_changed_to_${subscription_status}`
    : "subscription_updated";

  const ipAddress =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    null;

  const logResult = await admin
    .from("admin_access_log")
    .insert({
      admin_user_id: ctx.userId,
      tenant_id: id,
      action,
      resource_type: "subscription",
      resource_id: id,
      ip_address: ipAddress,
      user_agent: request.headers.get("user-agent") ?? null,
    })
    .select("id")
    .maybeSingle();

  if (logResult.error) {
    // Table may not exist yet (pre-040 migration). Log the warning but
    // never fail the actual subscription update because of it.
    console.warn(
      "[admin/subscriptions] admin_access_log insert failed (table may not exist yet):",
      logResult.error.message
    );
  }

  return NextResponse.json({ ok: true });
}
