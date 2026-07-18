import { NextResponse } from "next/server";
import crypto from "crypto";
import { getCurrentAccount, UnauthorizedError, ForbiddenError } from "@/lib/auth/account";
import { supabaseAdmin } from "@/lib/flows/admin-client";

// ---------------------------------------------------------------------------
// POST /api/billing/verify-payment
//
// Called from the client immediately after Razorpay's payment success handler
// fires. Verifies the HMAC signature server-side and updates the DB right
// away — no need to wait for the async webhook to arrive.
//
// This makes plan activation instant and reliable in ALL environments,
// including production where webhooks may be delayed or misconfigured.
// ---------------------------------------------------------------------------

const VALID_PLANS = new Set([
  "basic_monthly",
  "pro_monthly",
  "premium_monthly",
  "basic_yearly",
  "pro_yearly",
  "premium_yearly",
  "basic",
  "pro",
  "premium",
]);

export async function POST(request: Request) {
  try {
    const ctx = await getCurrentAccount();

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      plan,
    } = await request.json();

    // ── 1. Input validation ────────────────────────────────────────────────
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "Missing payment verification fields" },
        { status: 400 }
      );
    }

    if (!plan || !VALID_PLANS.has(plan)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    // ── 2. Verify Razorpay HMAC signature ──────────────────────────────────
    // Razorpay signs: order_id + "|" + payment_id with the key secret
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      console.error("[verify-payment] RAZORPAY_KEY_SECRET not set");
      return NextResponse.json(
        { error: "Billing not configured on this server" },
        { status: 503 }
      );
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      console.warn(
        `[verify-payment] Signature mismatch for account ${ctx.accountId}`
      );
      return NextResponse.json(
        { error: "Payment signature verification failed" },
        { status: 401 }
      );
    }

    // ── 3. Compute subscription dates ─────────────────────────────────────
    const now = new Date();
    const end = new Date(now);
    if (plan.includes("yearly")) {
      end.setFullYear(end.getFullYear() + 1);
    } else {
      end.setMonth(end.getMonth() + 1);
    }

    // ── 4. Update account in DB ────────────────────────────────────────────
    const admin = supabaseAdmin();
    const { error: dbError } = await admin
      .from("accounts")
      .update({
        subscription_status: "active",
        subscription_plan: plan,
        subscription_start_at: now.toISOString(),
        subscription_end_at: end.toISOString(),
        subscription_source: "razorpay",
        subscription_notes: `Razorpay Payment ID: ${razorpay_payment_id}`,
        grace_ends_at: null,
        updated_at: now.toISOString(),
      })
      .eq("id", ctx.accountId);

    if (dbError) {
      console.error("[verify-payment] DB update error:", dbError.message);
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    console.log(
      `[verify-payment] Plan activated: ${plan} for account ${ctx.accountId} (payment: ${razorpay_payment_id})`
    );

    return NextResponse.json({ ok: true, plan, activatedAt: now.toISOString() });
  } catch (err) {
    if (err instanceof UnauthorizedError || err instanceof ForbiddenError) {
      return NextResponse.json(
        { error: (err as UnauthorizedError | ForbiddenError).message },
        { status: (err as UnauthorizedError | ForbiddenError).status }
      );
    }
    console.error("[verify-payment] Unexpected error:", err);
    return NextResponse.json(
      { error: "Payment verification failed" },
      { status: 500 }
    );
  }
}
