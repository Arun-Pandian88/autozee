import { NextResponse } from "next/server";
import { getAdminAccount } from "@/lib/auth/account";
import { supabaseAdmin } from "@/lib/flows/admin-client";

export async function PATCH(request: Request) {
  const ctx = await getAdminAccount().catch(() => null);
  if (!ctx?.isSuperAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { userId, isSuperAdmin } = await request.json();
  if (!userId || typeof isSuperAdmin !== "boolean") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { error } = await supabaseAdmin()
    .from("profiles")
    .update({ is_super_admin: isSuperAdmin })
    .eq("user_id", userId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
