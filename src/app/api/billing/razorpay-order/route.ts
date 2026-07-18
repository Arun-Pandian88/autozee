import { NextResponse } from "next/server";
import { getCurrentAccount, UnauthorizedError, ForbiddenError } from "@/lib/auth/account";
import Razorpay from "razorpay";

const PRICES_INR: Record<string, number> = {
  // Monthly plans
  basic_monthly:   499,
  pro_monthly:     999,
  premium_monthly: 4_999,
  // Yearly plans (20% off)
  basic_yearly:    4_790,
  pro_yearly:      9_590,
  premium_yearly:  47_990,
  // Bare tier names (resolved as monthly when no cycle suffix)
  basic:   499,
  pro:     999,
  premium: 4_999,
};

export async function POST(request: Request) {
  try {
    const ctx = await getCurrentAccount();
    const { plan } = await request.json();

    if (!PRICES_INR[plan]) {
      return NextResponse.json({ error: "Invalid plan selected" }, { status: 400 });
    }

    const baseAmount = PRICES_INR[plan];
    const markupFee = baseAmount * 0.15;
    const amount = Math.round((baseAmount + markupFee) * 100);

    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    const isConfigured =
      keyId &&
      keySecret &&
      !keyId.includes("dummy") && !keySecret.includes("dummy") &&
      keyId.startsWith("rzp_");

    if (!isConfigured) {
      console.error("Missing or placeholder Razorpay keys in environment.");
      return NextResponse.json({ error: "Billing is not configured on this server." }, { status: 503 });
    }

    // ── DEV mock: skip real Razorpay API call ─────────────────────────────
    // Set RAZORPAY_DEV_MOCK=true in .env.local to bypass the network call
    // when you don't have valid test credentials. The billing-client will
    // detect the devMock flag and use sync-dev for the DB update instead.
    if (process.env.NODE_ENV === "development" && process.env.RAZORPAY_DEV_MOCK === "true") {
      const mockOrder = {
        id: `order_DEV_${Date.now()}`,
        amount,
        currency: "INR",
        receipt: `r_${ctx.accountId.split("-")[0]}_${Date.now()}`,
        notes: { account_id: ctx.accountId, plan },
      };
      console.log("[razorpay-order] DEV MOCK order:", mockOrder.id, "plan:", plan);
      return NextResponse.json({ order: mockOrder, devMock: true });
    }

    // ── Real Razorpay API call ─────────────────────────────────────────────
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: `r_${ctx.accountId.split("-")[0]}_${Date.now()}`,
      notes: {
        account_id: ctx.accountId,
        plan: plan,
      },
    });

    return NextResponse.json({ order });
  } catch (err) {
    if (err instanceof UnauthorizedError || err instanceof ForbiddenError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    // Log full Razorpay error details for easier debugging
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const e = err as any;
    console.error("[razorpay-order] error:", {
      statusCode: e?.statusCode,
      error: e?.error,
      message: e?.message,
      description: e?.error?.description,
    });
    const description = e?.error?.description || e?.message || "Failed to create order";
    return NextResponse.json({ error: description }, { status: 500 });
  }
}
