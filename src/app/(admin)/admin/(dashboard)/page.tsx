import { redirect } from "next/navigation";
import { getCurrentAccount } from "@/lib/auth/account";
import { supabaseAdmin } from "@/lib/flows/admin-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Super Admin — Autozee",
  robots: { index: false, follow: false },
};

interface AccountRow {
  id: string;
  name: string;
  created_at: string;
  owner_user_id: string;
}

interface ProfileRow {
  user_id: string;
  full_name: string;
  email: string;
  account_role: string;
  account_id: string;
  is_super_admin: boolean;
  created_at: string;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const d = Math.floor(diff / 86400000);
  const h = Math.floor(diff / 3600000);
  const m = Math.floor(diff / 60000);
  if (d > 0) return `${d}d ago`;
  if (h > 0) return `${h}h ago`;
  return `${m}m ago`;
}

export default async function AdminDashboardPage() {
  const ctx = await getCurrentAccount().catch(() => null);
  if (!ctx?.isSuperAdmin) redirect("/admin/login");

  const admin = supabaseAdmin();

  const [
    { data: accounts, count: accountsCount },
    { data: profiles, count: usersCount },
  ] = await Promise.all([
    admin
      .from("accounts")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false }),
    admin
      .from("profiles")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false }),
  ]);

  const profileMap = new Map<string, ProfileRow[]>();
  for (const p of (profiles as ProfileRow[]) ?? []) {
    const list = profileMap.get(p.account_id) ?? [];
    list.push(p);
    profileMap.set(p.account_id, list);
  }

  const superAdmins = (profiles as ProfileRow[])?.filter((p) => p.is_super_admin);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const newToday = (accounts as AccountRow[])?.filter(
    (a) => new Date(a.created_at) >= today
  ).length ?? 0;

  return (
    <div className="space-y-8">
      {/* Page header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-lg">👑</span>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Platform Overview
            </h1>
          </div>
          <p className="text-sm text-neutral-500">
            Zeenox dashboard — all workspaces and users across Autozee.
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Accounts" value={accountsCount ?? 0} sub={`+${newToday} joined today`} color="violet" icon="🏢" />
          <StatCard label="Total Users" value={usersCount ?? 0} sub="across all workspaces" color="blue" icon="👥" />
          <StatCard label="Super Admins" value={superAdmins?.length ?? 0} sub="platform administrators" color="amber" icon="👑" />
          <StatCard
            label="Avg Team Size"
            value={accountsCount ? (usersCount! / accountsCount).toFixed(1) : "0"}
            sub="members per account"
            color="emerald"
            icon="📊"
          />
        </div>

        {/* Accounts table */}
        <Section
          title="All Accounts"
          sub={`${accountsCount ?? 0} total workspaces`}
        >
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                {["Account", "Members", "Owner", "Created"].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                    style={{ color: "rgba(148,163,184,0.5)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(accounts as AccountRow[])?.map((acc) => {
                const members = profileMap.get(acc.id) ?? [];
                const owner = members.find((m) => m.user_id === acc.owner_user_id);
                return (
                  <tr
                    key={acc.id}
                    className="hover:bg-white/5 transition-colors"
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold"
                          style={{
                            background: "rgba(124,58,237,0.1)",
                            border: "1px solid rgba(124,58,237,0.2)",
                            color: "#a78bfa",
                          }}
                        >
                          {acc.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-white">{acc.name}</p>
                          <p className="text-xs font-mono" style={{ color: "rgba(148,163,184,0.4)" }}>
                            {acc.id.slice(0, 8)}…
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex -space-x-1">
                        {members.slice(0, 4).map((m) => (
                          <div
                            key={m.user_id}
                            title={m.full_name || m.email}
                            className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold"
                            style={{
                              background: "rgba(255,255,255,0.08)",
                              border: "2px solid #080b14",
                              color: "rgba(226,232,240,0.7)",
                            }}
                          >
                            {(m.full_name || m.email).charAt(0).toUpperCase()}
                          </div>
                        ))}
                        {members.length > 4 && (
                          <div
                            className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold"
                            style={{
                              background: "rgba(255,255,255,0.06)",
                              border: "2px solid #080b14",
                              color: "rgba(148,163,184,0.5)",
                            }}
                          >
                            +{members.length - 4}
                          </div>
                        )}
                      </div>
                      <p className="mt-1 text-xs" style={{ color: "rgba(148,163,184,0.45)" }}>
                        {members.length} member{members.length !== 1 ? "s" : ""}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      {owner ? (
                        <div>
                          <p className="font-medium" style={{ color: "rgba(226,232,240,0.85)" }}>
                            {owner.full_name || "—"}
                          </p>
                          <p className="text-xs" style={{ color: "rgba(148,163,184,0.45)" }}>
                            {owner.email}
                          </p>
                        </div>
                      ) : (
                        <span style={{ color: "rgba(148,163,184,0.3)" }}>Unknown</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs" style={{ color: "rgba(226,232,240,0.6)" }}>
                        {new Date(acc.created_at).toLocaleDateString()}
                      </p>
                      <p className="text-xs" style={{ color: "rgba(148,163,184,0.35)" }}>
                        {timeAgo(acc.created_at)}
                      </p>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!accounts?.length && <EmptyState text="No accounts found" />}
        </Section>

        {/* Users table */}
        <Section title="All Users" sub={`${usersCount ?? 0} registered users`}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                {["User", "Workspace Role", "Status", "Joined"].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                    style={{ color: "rgba(148,163,184,0.5)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(profiles as ProfileRow[])?.map((p) => (
                <tr
                  key={p.user_id}
                  className="hover:bg-white/5 transition-colors"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                        style={{
                          background: "rgba(255,255,255,0.07)",
                          color: "rgba(226,232,240,0.7)",
                        }}
                      >
                        {(p.full_name || p.email).charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-white">
                          {p.full_name || "—"}
                        </p>
                        <p className="text-xs" style={{ color: "rgba(148,163,184,0.5)" }}>
                          {p.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <RoleBadge role={p.account_role} />
                  </td>
                  <td className="px-6 py-4">
                    {p.is_super_admin ? (
                      <span
                        className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold"
                        style={{
                          background: "rgba(245,158,11,0.1)",
                          color: "#fbbf24",
                          border: "1px solid rgba(245,158,11,0.2)",
                        }}
                      >
                        👑 Super Admin
                      </span>
                    ) : (
                      <span
                        className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                        style={{
                          background: "rgba(52,211,153,0.1)",
                          color: "#34d399",
                          border: "1px solid rgba(52,211,153,0.15)",
                        }}
                      >
                        ● Active
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs" style={{ color: "rgba(226,232,240,0.6)" }}>
                      {new Date(p.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-xs" style={{ color: "rgba(148,163,184,0.35)" }}>
                      {timeAgo(p.created_at)}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!profiles?.length && <EmptyState text="No users found" />}
        </Section>
      </div>
  );
}

/* ─── shared sub-components ─────────────────────────── */

function Section({
  title,
  sub,
  children,
}: {
  title: string;
  sub: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <div
        className="px-6 py-4"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <h2 className="text-base font-semibold text-white">{title}</h2>
        <p className="text-xs mt-0.5" style={{ color: "rgba(148,163,184,0.5)" }}>
          {sub}
        </p>
      </div>
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="py-16 text-center text-sm" style={{ color: "rgba(148,163,184,0.3)" }}>
      {text}
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  icon,
  color,
}: {
  label: string;
  value: number | string;
  sub: string;
  icon: string;
  color: "violet" | "blue" | "emerald" | "amber";
}) {
  const colorMap = {
    violet: {
      bg: "rgba(124,58,237,0.08)",
      border: "rgba(124,58,237,0.2)",
      iconBg: "rgba(124,58,237,0.12)",
      iconBorder: "rgba(124,58,237,0.2)",
      iconColor: "#a78bfa",
    },
    blue: {
      bg: "rgba(59,130,246,0.06)",
      border: "rgba(59,130,246,0.15)",
      iconBg: "rgba(59,130,246,0.1)",
      iconBorder: "rgba(59,130,246,0.2)",
      iconColor: "#60a5fa",
    },
    emerald: {
      bg: "rgba(16,185,129,0.06)",
      border: "rgba(16,185,129,0.15)",
      iconBg: "rgba(16,185,129,0.1)",
      iconBorder: "rgba(16,185,129,0.2)",
      iconColor: "#34d399",
    },
    amber: {
      bg: "rgba(245,158,11,0.06)",
      border: "rgba(245,158,11,0.15)",
      iconBg: "rgba(245,158,11,0.1)",
      iconBorder: "rgba(245,158,11,0.2)",
      iconColor: "#fbbf24",
    },
  };
  const c = colorMap[color];
  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: c.bg, border: `1px solid ${c.border}` }}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm" style={{ color: "rgba(148,163,184,0.7)" }}>
            {label}
          </p>
          <p className="text-3xl font-bold tracking-tight text-white">
            {value}
          </p>
          <p className="text-xs" style={{ color: "rgba(148,163,184,0.45)" }}>
            {sub}
          </p>
        </div>
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl text-xl"
          style={{
            background: c.iconBg,
            border: `1px solid ${c.iconBorder}`,
          }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  const map: Record<string, { bg: string; color: string; border: string; label: string }> = {
    owner: { bg: "rgba(124,58,237,0.1)", color: "#a78bfa", border: "rgba(124,58,237,0.2)", label: "Owner" },
    admin: { bg: "rgba(59,130,246,0.1)", color: "#60a5fa", border: "rgba(59,130,246,0.2)", label: "Admin" },
    agent: { bg: "rgba(52,211,153,0.1)", color: "#34d399", border: "rgba(52,211,153,0.2)", label: "Agent" },
    viewer: { bg: "rgba(148,163,184,0.08)", color: "rgba(148,163,184,0.6)", border: "rgba(148,163,184,0.15)", label: "Viewer" },
  };
  const s = map[role] ?? map.viewer;
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}
    >
      {s.label}
    </span>
  );
}
