import { NextResponse } from "next/server";
import { getCurrentAccount } from "@/lib/auth/account";
import { supabaseAdmin } from "@/lib/flows/admin-client";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  // Must be super admin
  const ctx = await getCurrentAccount().catch(() => null);
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
  } = body;

  // Build patch — only include defined fields
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (subscription_status !== undefined) patch.subscription_status = subscription_status;
  if (subscription_plan !== undefined) patch.subscription_plan = subscription_plan;
  if (subscription_start_at !== undefined) patch.subscription_start_at = subscription_start_at;
  if (subscription_end_at !== undefined) patch.subscription_end_at = subscription_end_at;
  if (subscription_source !== undefined) patch.subscription_source = subscription_source;
  if (subscription_notes !== undefined) patch.subscription_notes = subscription_notes;

  // Auto-set start date when activating
  if (subscription_status === "active" && !subscription_start_at) {
    patch.subscription_start_at = new Date().toISOString();
  }

  const { error } = await supabaseAdmin()
    .from("accounts")
    .update(patch)
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
