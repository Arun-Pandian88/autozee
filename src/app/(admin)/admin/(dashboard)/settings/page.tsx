import { supabaseAdmin } from "@/lib/flows/admin-client";
import { getAdminAccount } from "@/lib/auth/account";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Settings — Autozee Admin" };
export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const ctx = await getAdminAccount().catch(() => null);
  if (!ctx?.isSuperAdmin) redirect("/admin/login");

  const { data: superAdmins } = await supabaseAdmin()
    .from("profiles")
    .select("user_id, full_name, email, created_at")
    .eq("is_super_admin", true);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-sm text-neutral-500 mt-1">Platform-level configuration for Autozee</p>
      </div>

      {/* Super Admins section */}
      <div className="rounded-xl overflow-hidden" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white">Super Administrators</h2>
            <p className="text-xs text-neutral-500 mt-0.5">Users with platform-wide access</p>
          </div>
          <span className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
            style={{ background: "rgba(124,58,237,0.1)", color: "#a78bfa", border: "1px solid rgba(124,58,237,0.2)" }}>
            {superAdmins?.length ?? 0} admin{(superAdmins?.length ?? 0) !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="divide-y divide-white/[0.04]">
          {(superAdmins ?? []).map(u => (
            <div key={u.user_id} className="flex items-center gap-4 px-6 py-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold"
                style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", color: "#fbbf24" }}>
                {(u.full_name || u.email).charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-white">{u.full_name || "—"}</p>
                  {u.email === "zeenoxofficial@gmail.com" && (
                    <span className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                      style={{ background: "rgba(245,158,11,0.1)", color: "#fbbf24", border: "1px solid rgba(245,158,11,0.2)" }}>
                      Founder
                    </span>
                  )}
                </div>
                <p className="text-xs text-neutral-500">{u.email}</p>
              </div>
              <p className="text-xs text-neutral-600">
                {new Date(u.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Platform Info */}
      <div className="rounded-xl overflow-hidden" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="px-6 py-4 border-b border-white/5">
          <h2 className="text-sm font-semibold text-white">Platform Information</h2>
        </div>
        <div className="divide-y divide-white/[0.04]">
          {[
            { label: "Product", value: "Autozee" },
            { label: "Founder", value: "Zeenox" },
            { label: "Admin Access URL", value: "/admin/login" },
            { label: "Customer Login URL", value: "/login" },
          ].map(row => (
            <div key={row.label} className="flex items-center justify-between px-6 py-4">
              <p className="text-sm text-neutral-400">{row.label}</p>
              <p className="text-sm text-white font-medium">{row.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
