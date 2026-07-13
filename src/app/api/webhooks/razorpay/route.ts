import { NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/flows/admin-client";

// ---------------------------------------------------------------------------
// Razorpay webhook handler
//
// Events handled:
//   payment.captured / order.paid → flip to active (new subscription or
//                                    payment during past_due grace period)
//   payment.failed                → flip to past_due, stamp grace_ends_at
//   subscription.cancelled        → flip to cancelled, stamp data_retention_until
//
// Signature verification: HMAC-SHA256 over raw body using RAZORPAY_WEBHOOK_SECRET.
// ---------------------------------------------------------------------------

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-razorpay-signature");
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!signature || !secret) {
      return NextResponse.json(
        { error: "Missing signature or secret" },
        { status: 400 }
      );
    }

    // Verify HMAC signature
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(rawBody);
    const admin = supabaseAdmin();

    // ── payment.captured / order.paid ──────────────────────────────────────
    // Covers: first payment during trial, upgrade, and payment during past_due
    // grace period (both should flip the account back to active).
    if (
      event.event === "payment.captured" ||
      event.event === "order.paid"
    ) {
      const entity =
        event.payload.payment?.entity || event.payload.order?.entity;
      const notes = entity?.notes || {};

      const account_id = notes.account_id as string | undefined;
      const plan = notes.plan as string | undefined;

      if (account_id && plan) {
        const now = new Date();
        const end = new Date(now);

        if (plan.includes("yearly")) {
          end.setFullYear(end.getFullYear() + 1);
        } else {
          // monthly or bare plan name → 1 month
          end.setMonth(end.getMonth() + 1);
        }

        const { error } = await admin
          .from("accounts")
          .update({
            subscription_status: "active",
            subscription_plan: plan,
            subscription_start_at: now.toISOString(),
            subscription_end_at: end.toISOString(),
            subscription_source: "razorpay",
            subscription_notes: `Razorpay Payment ID: ${entity.id}`,
            // Clear grace period fields when payment comes in
            grace_ends_at: null,
            updated_at: now.toISOString(),
          })
          .eq("id", account_id);

        if (error) {
          console.error("[webhooks/razorpay] payment.captured DB error:", error.message);
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        console.log(
          `[webhooks/razorpay] Activated ${plan} for account ${account_id} (${event.event})`
        );
      }

      return NextResponse.json({ ok: true });
    }

    // ── payment.failed ─────────────────────────────────────────────────────
    // Renewal payment failed → flip active → past_due and stamp the grace window.
    // Note: this only fires for Razorpay Subscriptions (recurring billing).
    // For one-time orders the Super Admin can manually set past_due via the
    // admin portal when a renewal is not received.
    if (event.event === "payment.failed") {
      const entity = event.payload.payment?.entity;
      const notes = entity?.notes || {};
      const account_id = notes.account_id as string | undefined;

      if (account_id) {
        // Fetch the account's current grace_period_days setting (default 3)
        const { data: acct } = await admin
          .from("accounts")
          .select("grace_period_days, subscription_status")
          .eq("id", account_id)
          .maybeSingle();

        // Only transition active → past_due (don't re-transition already expired)
        if (acct?.subscription_status === "active") {
          const graceDays =
            typeof acct.grace_period_days === "number" ? acct.grace_period_days : 3;
          const graceEnd = new Date();
          graceEnd.setDate(graceEnd.getDate() + graceDays);

          const { error } = await admin
            .from("accounts")
            .update({
              subscription_status: "past_due",
              grace_ends_at: graceEnd.toISOString(),
              subscription_notes: `Payment failed: ${entity?.id ?? "unknown"} — grace until ${graceEnd.toDateString()}`,
              updated_at: new Date().toISOString(),
            })
            .eq("id", account_id);

          if (error) {
            console.error("[webhooks/razorpay] payment.failed DB error:", error.message);
          } else {
            console.log(
              `[webhooks/razorpay] Account ${account_id} → past_due (grace until ${graceEnd.toISOString()})`
            );
          }
        }
      }

      return NextResponse.json({ ok: true });
    }

    // ── subscription.cancelled ─────────────────────────────────────────────
    // Owner cancelled → read-only mode + 30-day data retention window.
    if (event.event === "subscription.cancelled") {
      const entity = event.payload.subscription?.entity;
      const notes = entity?.notes || {};
      const account_id = notes.account_id as string | undefined;

      if (account_id) {
        const now = new Date();
        const dataRetention = new Date(now);
        dataRetention.setDate(dataRetention.getDate() + 30);

        const { error } = await admin
          .from("accounts")
          .update({
            subscription_status: "cancelled",
            cancelled_at: now.toISOString(),
            data_retention_until: dataRetention.toISOString(),
            subscription_notes: `Cancelled via Razorpay webhook — data retained until ${dataRetention.toDateString()}`,
            updated_at: now.toISOString(),
          })
          .eq("id", account_id);

        if (error) {
          console.error("[webhooks/razorpay] subscription.cancelled DB error:", error.message);
        } else {
          console.log(
            `[webhooks/razorpay] Account ${account_id} → cancelled (data until ${dataRetention.toISOString()})`
          );
        }
      }

      return NextResponse.json({ ok: true });
    }

    // Unhandled event type — acknowledge receipt so Razorpay stops retrying
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[webhooks/razorpay] Webhook error:", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
