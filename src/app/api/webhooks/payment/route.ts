import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/flows/admin-client";

/**
 * Webhook endpoint for payment gateways (Razorpay / Stripe).
 * Called automatically when a customer's payment succeeds.
 *
 * Expected body:
 * {
 *   account_id: string,       // Autozee account UUID
 *   plan: "monthly" | "yearly",
 *   source: "razorpay" | "stripe",
 *   payment_id?: string,       // optional, for audit
 *   secret: string             // WEBHOOK_SECRET from env
 * }
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Validate webhook secret
  const secret = process.env.WEBHOOK_SECRET;
  if (secret && body.secret !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { account_id, plan, source = "stripe", payment_id } = body;
  if (!account_id || !plan) {
    return NextResponse.json({ error: "account_id and plan required" }, { status: 400 });
  }

  // Calculate end date based on plan
  const now = new Date();
  const end = new Date(now);
  if (plan === "monthly") {
    end.setMonth(end.getMonth() + 1);
  } else if (plan === "yearly") {
    end.setFullYear(end.getFullYear() + 1);
  }

  const { error } = await supabaseAdmin()
    .from("accounts")
    .update({
      subscription_status: "active",
      subscription_plan: plan,
      subscription_start_at: now.toISOString(),
      subscription_end_at: end.toISOString(),
      subscription_source: source,
      subscription_notes: payment_id ? `Payment ID: ${payment_id}` : null,
      updated_at: now.toISOString(),
    })
    .eq("id", account_id);

  if (error) {
    console.error("[webhook/payment] DB error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  console.log(`[webhook/payment] Activated ${plan} for account ${account_id} via ${source}`);
  return NextResponse.json({ ok: true, account_id, plan, ends_at: end.toISOString() });
}
