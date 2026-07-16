import { supabaseAdmin } from "@/lib/flows/admin-client";
import ToggleSuperAdmin from "./toggle-super-admin";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Users — Autozee Admin" };
export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const admin = supabaseAdmin();
  const { data: profiles, count } = await admin
    .from("profiles")
    .select("*, accounts(name)", { count: "exact" })
    .order("created_at", { ascending: false });

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  const timeAgo = (d: string) => {
    // eslint-disable-next-line react-hooks/purity
    const diff = Date.now() - new Date(d).getTime();
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor(diff / 3600000);
    if (days > 0) return `${days}d ago`;
    return `${hours}h ago`;
  };

  const roleColors: Record<string, { bg: string; color: string; border: string }> = {
    owner: { bg: "rgba(124,58,237,0.1)", color: "#a78bfa", border: "rgba(124,58,237,0.2)" },
    admin: { bg: "rgba(59,130,246,0.1)", color: "#60a5fa", border: "rgba(59,130,246,0.2)" },
    agent: { bg: "rgba(16,185,129,0.1)", color: "#34d399", border: "rgba(16,185,129,0.15)" },
    viewer: { bg: "rgba(148,163,184,0.08)", color: "rgba(148,163,184,0.6)", border: "rgba(148,163,184,0.12)" },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Users</h1>
        <p className="text-sm text-neutral-500 mt-1">{count ?? 0} registered users across all workspaces</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Users", value: count ?? 0 },
          { label: "Owners", value: (profiles ?? []).filter(p => p.account_role === "owner").length },
          { label: "Agents", value: (profiles ?? []).filter(p => p.account_role === "agent").length },
          { label: "Super Admins", value: (profiles ?? []).filter(p => p.is_super_admin).length },
        ].map(s => (
          <div key={s.label} className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <p className="text-xs text-neutral-500">{s.label}</p>
            <p className="text-2xl font-bold text-white mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Users Table */}
      <div className="rounded-xl overflow-hidden" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="px-6 py-4 border-b border-white/5">
          <h2 className="text-sm font-semibold text-white">All Users</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                {["User", "Workspace", "Role", "Super Admin", "Joined"].map((h, i) => (
                  <th key={i} className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(profiles ?? []).map(p => {
                const rc = roleColors[p.account_role] ?? roleColors.viewer;
                return (
                  <tr key={p.user_id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                          style={{ background: "rgba(255,255,255,0.07)", color: "rgba(226,232,240,0.7)" }}>
                          {(p.full_name || p.email).charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-white">{p.full_name || "—"}</p>
                          <p className="text-xs text-neutral-600">{p.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      <p className="text-neutral-400 text-sm">{(p.accounts as any)?.name || "—"}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize"
                        style={{ background: rc.bg, color: rc.color, border: `1px solid ${rc.border}` }}>
                        {p.account_role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <ToggleSuperAdmin
                        userId={p.user_id}
                        email={p.email}
                        isSuperAdmin={!!p.is_super_admin}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-neutral-400 text-xs">{formatDate(p.created_at)}</p>
                      <p className="text-neutral-600 text-xs">{timeAgo(p.created_at)}</p>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!profiles?.length && (
            <div className="py-16 text-center text-sm text-neutral-600">No users yet</div>
          )}
        </div>
      </div>
    </div>
  );
}
