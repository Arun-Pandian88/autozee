import { supabaseAdmin } from "@/lib/flows/admin-client";
import { SubscriptionControls, ExportButton } from "./subscription-controls";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Subscriptions — Autozee Admin" };

type Status = "trial" | "active" | "inactive" | "expired";
type Plan   = "free" | "monthly" | "yearly";

interface Account {
  id: string; name: string; owner_user_id: string; created_at: string;
  subscription_status: Status; subscription_plan: Plan;
  subscription_start_at: string | null; subscription_end_at: string | null;
  subscription_source: string | null; subscription_notes: string | null;
}

const STATUS_TABS: Array<{ key: string; label: string }> = [
  { key: "all",      label: "All"      },
  { key: "active",   label: "Active"   },
  { key: "trial",    label: "Trial"    },
  { key: "inactive", label: "Inactive" },
  { key: "expired",  label: "Expired"  },
];

const formatDate = (d: string | null) =>
  d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

export default async function SubscriptionsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const { status: filterStatus = "all", q: search = "" } = await searchParams;

  const admin = supabaseAdmin();

  const [{ data: accounts, count }, { data: profiles }] = await Promise.all([
    admin.from("accounts").select("*", { count: "exact" }).order("created_at", { ascending: false }),
    admin.from("profiles").select("user_id, full_name, email, account_id"),
  ]);

  const ownerMap = new Map<string, { full_name: string; email: string }>();
  for (const p of profiles ?? []) ownerMap.set(p.user_id, { full_name: p.full_name, email: p.email });

  const profileByAccount = new Map<string, { full_name: string; email: string }>();
  for (const p of profiles ?? []) {
    if (!profileByAccount.has(p.account_id)) profileByAccount.set(p.account_id, { full_name: p.full_name, email: p.email });
  }

  let accs = (accounts ?? []) as Account[];

  // Filter by status
  if (filterStatus !== "all") accs = accs.filter(a => a.subscription_status === filterStatus);

  // Search by name or owner email
  if (search.trim()) {
    const q = search.trim().toLowerCase();
    accs = accs.filter(a => {
      const owner = ownerMap.get(a.owner_user_id) || profileByAccount.get(a.id);
      return a.name.toLowerCase().includes(q) || (owner?.email || "").toLowerCase().includes(q);
    });
  }

  const all = (accounts ?? []) as Account[];
  const statusCounts: Record<string, number> = {
    all: all.length,
    active:   all.filter(a => a.subscription_status === "active").length,
    trial:    all.filter(a => a.subscription_status === "trial").length,
    inactive: all.filter(a => a.subscription_status === "inactive").length,
    expired:  all.filter(a => a.subscription_status === "expired").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Subscriptions</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Manage and control customer subscription access.
          </p>
        </div>
        <ExportButton type="subscriptions" />
      </div>

      {/* Webhook info */}
      <div className="rounded-xl p-4 flex items-start gap-3"
        style={{ background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.12)" }}>
        <span className="text-base mt-0.5">⚡</span>
        <div>
          <p className="text-xs font-semibold text-violet-300">Auto-Activation Webhook</p>
          <p className="text-xs text-neutral-500 mt-0.5">
            POST to{" "}
            <code className="rounded px-1 py-px text-[11px] font-mono" style={{ background: "rgba(255,255,255,0.07)", color: "#a78bfa" }}>
              /api/webhooks/payment
            </code>{" "}
            with <code className="rounded px-1 py-px text-[11px] font-mono" style={{ background: "rgba(255,255,255,0.07)", color: "#a78bfa" }}>
              {"{ account_id, plan, source, secret }"}
            </code>{" "}
            to auto-activate on successful payment.
          </p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 flex-wrap">
        {STATUS_TABS.map(tab => {
          const active = filterStatus === tab.key;
          return (
            <a key={tab.key}
              href={`/admin/subscriptions?status=${tab.key}${search ? `&q=${encodeURIComponent(search)}` : ""}`}
              className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-all"
              style={active
                ? { background: "rgba(124,58,237,0.15)", color: "#a78bfa", border: "1px solid rgba(124,58,237,0.25)" }
                : { background: "rgba(255,255,255,0.04)", color: "rgba(148,163,184,0.6)", border: "1px solid rgba(255,255,255,0.07)" }}>
              {tab.label}
              <span className="rounded-full px-1.5 py-px text-[10px] font-bold"
                style={{ background: active ? "rgba(124,58,237,0.2)" : "rgba(255,255,255,0.06)", color: active ? "#a78bfa" : "rgba(148,163,184,0.5)" }}>
                {statusCounts[tab.key]}
              </span>
            </a>
          );
        })}

        {/* Search */}
        <form method="GET" action="/admin/subscriptions" className="ml-auto">
          {filterStatus !== "all" && (
            <input type="hidden" name="status" value={filterStatus} />
          )}
          <input type="text" name="q" defaultValue={search}
            placeholder="Search by name or email…"
            className="rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-neutral-600 outline-none"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", minWidth: "200px" }} />
        </form>
      </div>

      {/* Accounts list */}
      <div className="rounded-xl overflow-hidden"
        style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white">Results</h2>
            <p className="text-xs text-neutral-600 mt-0.5">{accs.length} account{accs.length !== 1 ? "s" : ""}</p>
          </div>
        </div>

        <div className="divide-y divide-white/[0.04]">
          {accs.map(acc => {
            const owner = ownerMap.get(acc.owner_user_id) || profileByAccount.get(acc.id);
            const isExpiringSoon = acc.subscription_status === "active" && acc.subscription_end_at &&
              new Date(acc.subscription_end_at).getTime() - Date.now() < 7 * 86400000 &&
              new Date(acc.subscription_end_at).getTime() > Date.now();

            return (
              <div key={acc.id} className="px-6 py-5 hover:bg-white/[0.015] transition-colors">
                {/* Account row */}
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold"
                      style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)", color: "#a78bfa" }}>
                      {acc.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-white">{acc.name}</p>
                        {isExpiringSoon && (
                          <span className="rounded-full px-2 py-px text-[10px] font-bold"
                            style={{ background: "rgba(251,146,60,0.15)", color: "#fb923c", border: "1px solid rgba(251,146,60,0.25)" }}>
                            ⚠ Expiring Soon
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-500">{owner?.email || "No owner"}</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1 text-xs text-neutral-500">
                    <div>
                      <span className="text-neutral-600">Plan: </span>
                      <span className="capitalize font-medium text-neutral-400">{acc.subscription_plan}</span>
                      <span className="text-neutral-700"> · </span>
                      <span className="text-neutral-600">Source: </span>
                      <span className="capitalize text-neutral-500">{acc.subscription_source || "—"}</span>
                    </div>
                    <div>
                      <span className="text-neutral-600">Expires: </span>
                      <span className={`font-medium ${isExpiringSoon ? "text-orange-400" : "text-neutral-400"}`}>
                        {formatDate(acc.subscription_end_at)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Controls */}
                <div className="mt-4">
                  <SubscriptionControls
                    accountId={acc.id}
                    currentStatus={acc.subscription_status}
                    currentPlan={acc.subscription_plan}
                    endDate={acc.subscription_end_at}
                    currentNotes={acc.subscription_notes}
                  />
                </div>
              </div>
            );
          })}

          {!accs.length && (
            <div className="py-16 text-center text-sm text-neutral-600">
              {search ? `No results for "${search}"` : "No accounts"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
