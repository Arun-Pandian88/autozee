import { NextResponse } from "next/server";
import { getCurrentAccount } from "@/lib/auth/account";
import { supabaseAdmin } from "@/lib/flows/admin-client";

export async function GET(request: Request) {
  const ctx = await getCurrentAccount().catch(() => null);
  if (!ctx?.isSuperAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "subscriptions";

  if (type === "subscriptions") {
    const { data } = await supabaseAdmin()
      .from("accounts")
      .select("id, name, owner_user_id, created_at, subscription_status, subscription_plan, subscription_start_at, subscription_end_at, subscription_source, subscription_notes")
      .order("created_at", { ascending: false });

    const rows = data ?? [];
    const csv = [
      ["ID", "Name", "Status", "Plan", "Start Date", "End Date", "Source", "Notes", "Created"].join(","),
      ...rows.map(r => [
        r.id,
        `"${r.name.replace(/"/g, '""')}"`,
        r.subscription_status,
        r.subscription_plan,
        r.subscription_start_at ?? "",
        r.subscription_end_at ?? "",
        r.subscription_source ?? "",
        `"${(r.subscription_notes ?? "").replace(/"/g, '""')}"`,
        r.created_at,
      ].join(",")),
    ].join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="autozee-subscriptions-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  }

  if (type === "users") {
    const { data } = await supabaseAdmin()
      .from("profiles")
      .select("user_id, full_name, email, account_role, is_super_admin, created_at")
      .order("created_at", { ascending: false });

    const rows = data ?? [];
    const csv = [
      ["User ID", "Name", "Email", "Role", "Super Admin", "Joined"].join(","),
      ...rows.map(r => [
        r.user_id,
        `"${(r.full_name ?? "").replace(/"/g, '""')}"`,
        r.email,
        r.account_role,
        r.is_super_admin ? "Yes" : "No",
        r.created_at,
      ].join(",")),
    ].join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="autozee-users-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  }

  return NextResponse.json({ error: "Unknown export type" }, { status: 400 });
}
