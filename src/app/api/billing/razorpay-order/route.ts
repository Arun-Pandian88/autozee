import { NextResponse } from "next/server";
import { getCurrentAccount, UnauthorizedError, ForbiddenError } from "@/lib/auth/account";
import Razorpay from "razorpay";

const PRICES_INR: Record<string, number> = {
  basic_monthly: 499,
  basic_yearly: 4790,
  pro_monthly: 999,
  pro_yearly: 9590,
  premium_monthly: 2499,
  premium_yearly: 23990,
};

export async function POST(request: Request) {
  try {
    const ctx = await getCurrentAccount();
    const { plan } = await request.json();

    if (!PRICES_INR[plan]) {
      return NextResponse.json({ error: "Invalid plan selected" }, { status: 400 });
    }

    const amount = PRICES_INR[plan] * 100;

    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    const isConfigured =
      keyId && keySecret &&
      !keyId.includes("dummy") && !keySecret.includes("dummy") &&
      keyId.startsWith("rzp_");

    if (!isConfigured) {
      console.error("Missing or placeholder Razorpay keys in environment.");
      return NextResponse.json({ error: "Billing is not configured on this server." }, { status: 503 });
    }

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
    console.error("[razorpay-order] error:", err);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
