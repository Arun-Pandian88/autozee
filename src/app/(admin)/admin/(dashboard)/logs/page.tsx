import { supabaseAdmin } from "@/lib/flows/admin-client";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Activity Logs — Autozee Admin" };
export const dynamic = "force-dynamic";

export default async function LogsPage() {
  const admin = supabaseAdmin();

  // Combine recent accounts and profiles as activity feed
  const [{ data: accounts }, { data: profiles }] = await Promise.all([
    admin.from("accounts").select("id, name, created_at, owner_user_id").order("created_at", { ascending: false }).limit(30),
    admin.from("profiles").select("user_id, full_name, email, account_id, created_at, is_super_admin, account_role").order("created_at", { ascending: false }).limit(30),
  ]);

  // Build unified timeline
  type Event = { type: "signup" | "workspace"; time: Date; label: string; sub: string; icon: string; color: string };
  const events: Event[] = [];

  for (const p of profiles ?? []) {
    events.push({
      type: "signup",
      time: new Date(p.created_at),
      label: p.full_name || p.email,
      sub: `Signed up as ${p.account_role}${p.is_super_admin ? " (Super Admin)" : ""}`,
      icon: p.is_super_admin ? "👑" : "👤",
      color: p.is_super_admin ? "#f59e0b" : "#7c3aed",
    });
  }
  for (const a of accounts ?? []) {
    events.push({
      type: "workspace",
      time: new Date(a.created_at),
      label: a.name,
      sub: "New workspace created",
      icon: "🏢",
      color: "#3b82f6",
    });
  }

  events.sort((a, b) => b.time.getTime() - a.time.getTime());
  const top = events.slice(0, 40);

  const timeAgo = (d: Date) => {
    // eslint-disable-next-line react-hooks/purity
    const diff = Date.now() - d.getTime();
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor(diff / 3600000);
    const mins = Math.floor(diff / 60000);
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return `${mins}m ago`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Activity Logs</h1>
        <p className="text-sm text-neutral-500 mt-1">Recent platform-wide activity</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Events (Last 30d)", value: top.length },
          { label: "New Signups", value: (profiles ?? []).length },
          { label: "New Workspaces", value: (accounts ?? []).length },
        ].map(s => (
          <div key={s.label} className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <p className="text-xs text-neutral-500">{s.label}</p>
            <p className="text-2xl font-bold text-white mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Timeline */}
      <div className="rounded-xl overflow-hidden" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="px-6 py-4 border-b border-white/5">
          <h2 className="text-sm font-semibold text-white">Timeline</h2>
        </div>
        <div className="px-6 py-4 space-y-0">
          {top.map((ev, i) => (
            <div key={i} className="flex gap-4 py-3 border-b border-white/[0.03] last:border-0">
              {/* Icon */}
              <div className="relative flex flex-col items-center">
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm"
                  style={{ background: `${ev.color}1a`, border: `1px solid ${ev.color}33` }}
                >
                  {ev.icon}
                </div>
                {i < top.length - 1 && (
                  <div className="w-px flex-1 mt-1" style={{ background: "rgba(255,255,255,0.05)", minHeight: "20px" }} />
                )}
              </div>
              {/* Content */}
              <div className="flex-1 pb-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-white text-sm">{ev.label}</p>
                  <p className="text-xs text-neutral-600 shrink-0">{timeAgo(ev.time)}</p>
                </div>
                <p className="text-xs text-neutral-500 mt-0.5">{ev.sub}</p>
              </div>
            </div>
          ))}
          {top.length === 0 && (
            <div className="py-12 text-center text-sm text-neutral-600">No activity yet</div>
          )}
        </div>
      </div>
    </div>
  );
}
