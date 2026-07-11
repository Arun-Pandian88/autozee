import { NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/flows/admin-client";

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-razorpay-signature");
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!signature || !secret) {
      return NextResponse.json({ error: "Missing signature or secret" }, { status: 400 });
    }

    // Verify signature
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(rawBody);

    // We listen for payment.captured or order.paid
    if (event.event === "payment.captured" || event.event === "order.paid") {
      const entity = event.payload.payment?.entity || event.payload.order?.entity;
      const notes = entity?.notes || {};
      
      const account_id = notes.account_id;
      const plan = notes.plan;

      if (account_id && plan) {
        // Calculate end date based on plan
        const now = new Date();
        const end = new Date(now);
        if (plan.includes("monthly")) {
          end.setMonth(end.getMonth() + 1);
        } else if (plan.includes("yearly")) {
          end.setFullYear(end.getFullYear() + 1);
        }

        const { error } = await supabaseAdmin()
          .from("accounts")
          .update({
            subscription_status: "active",
            subscription_plan: plan,
            subscription_start_at: now.toISOString(),
            subscription_end_at: end.toISOString(),
            subscription_source: "razorpay",
            subscription_notes: `Razorpay Payment ID: ${entity.id}`,
            updated_at: now.toISOString(),
          })
          .eq("id", account_id);

        if (error) {
          console.error("[webhooks/razorpay] DB error:", error.message);
          return NextResponse.json({ error: error.message }, { status: 500 });
        }
        
        console.log(`[webhooks/razorpay] Successfully activated ${plan} for account ${account_id}`);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[webhooks/razorpay] Webhook error:", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
