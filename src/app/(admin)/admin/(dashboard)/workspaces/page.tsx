import { supabaseAdmin } from "@/lib/flows/admin-client";
import { Building2, Users, ExternalLink } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Workspaces — Autozee Admin" };

export default async function WorkspacesPage() {
  const admin = supabaseAdmin();

  const [
    { data: accounts, count },
    { data: profiles },
  ] = await Promise.all([
    admin.from("accounts").select("*", { count: "exact" }).order("created_at", { ascending: false }),
    admin.from("profiles").select("user_id, full_name, email, account_id, account_role"),
  ]);

  const profileMap = new Map<string, typeof profiles>();
  for (const p of profiles ?? []) {
    const list = profileMap.get(p.account_id) ?? [];
    list.push(p);
    profileMap.set(p.account_id, list as any);
  }

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  const timeAgo = (d: string) => {
    const diff = Date.now() - new Date(d).getTime();
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor(diff / 3600000);
    if (days > 30) return `${Math.floor(days / 30)}mo ago`;
    if (days > 0) return `${days}d ago`;
    return `${hours}h ago`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Workspaces</h1>
        <p className="text-sm text-neutral-500 mt-1">
          {count ?? 0} total workspaces registered on Autozee
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total", value: count ?? 0, color: "#7c3aed" },
          { label: "This Week", value: (accounts ?? []).filter(a => Date.now() - new Date(a.created_at).getTime() < 7 * 86400000).length, color: "#3b82f6" },
          { label: "Today", value: (accounts ?? []).filter(a => Date.now() - new Date(a.created_at).getTime() < 86400000).length, color: "#10b981" },
        ].map(s => (
          <div key={s.label} className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <p className="text-xs text-neutral-500">{s.label}</p>
            <p className="text-2xl font-bold text-white mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl overflow-hidden" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="px-6 py-4 border-b border-white/5">
          <h2 className="text-sm font-semibold text-white">All Workspaces</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                {["Workspace", "Members", "Owner", "Created", ""].map((h, i) => (
                  <th key={i} className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(accounts ?? []).map(acc => {
                const members: any[] = profileMap.get(acc.id) ?? [];
                const owner = members.find(m => m.user_id === acc.owner_user_id);
                return (
                  <tr key={acc.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold"
                          style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)", color: "#a78bfa" }}
                        >
                          {acc.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-white">{acc.name}</p>
                          <p className="text-xs text-neutral-600 font-mono">{acc.id.slice(0, 8)}…</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-1.5">
                          {members.slice(0, 3).map((m, i) => (
                            <div key={i} title={m.full_name || m.email}
                              className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold"
                              style={{ background: "rgba(255,255,255,0.08)", border: "2px solid #05070d", color: "rgba(226,232,240,0.7)" }}
                            >
                              {(m.full_name || m.email).charAt(0).toUpperCase()}
                            </div>
                          ))}
                        </div>
                        <span className="text-xs text-neutral-500">{members.length}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-neutral-300 font-medium">{owner?.full_name || "—"}</p>
                        <p className="text-xs text-neutral-600">{owner?.email || "Unknown"}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-neutral-400 text-xs">{formatDate(acc.created_at)}</p>
                      <p className="text-neutral-600 text-xs">{timeAgo(acc.created_at)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer"
                        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
                      >
                        <ExternalLink className="h-3 w-3" />
                        View
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!accounts?.length && (
            <div className="py-16 text-center text-sm text-neutral-600">No workspaces yet</div>
          )}
        </div>
      </div>
    </div>
  );
}
