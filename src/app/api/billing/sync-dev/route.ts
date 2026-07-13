import { NextResponse } from "next/server";
import { getCurrentAccount } from "@/lib/auth/account";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  // This is a DEV-ONLY helper to bypass the lack of webhooks on localhost.
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Only available in development" }, { status: 403 });
  }

  try {
    const ctx = await getCurrentAccount();
    const { plan } = await request.json();

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    const { error } = await supabase.from("accounts").update({
      subscription_status: "active",
      subscription_plan: plan,
      subscription_source: "razorpay",
    }).eq("id", ctx.accountId);

    if (error) {
      console.error("Supabase update error:", error);
      throw new Error(error.message);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
