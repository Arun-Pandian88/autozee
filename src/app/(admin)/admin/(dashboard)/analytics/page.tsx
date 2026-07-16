import { supabaseAdmin } from "@/lib/flows/admin-client";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Analytics — Autozee Admin" };
export const dynamic = "force-dynamic";

const MONTHLY_PRICE = 999;   // ₹ per month
const YEARLY_PRICE  = 9999;  // ₹ per year

type Account = {
  subscription_status: string;
  subscription_plan: string;
  subscription_start_at: string | null;
  subscription_end_at: string | null;
  created_at: string;
};

function calcMRR(accounts: Account[]) {
  return accounts
    .filter(a => a.subscription_status === "active")
    .reduce((sum, a) => {
      if (a.subscription_plan === "monthly") return sum + MONTHLY_PRICE;
      if (a.subscription_plan === "yearly")  return sum + Math.round(YEARLY_PRICE / 12);
      return sum;
    }, 0);
}

// Last 6 months growth chart data
function buildMonthlyGrowth(accounts: Account[]) {
  const months: { label: string; count: number; revenue: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i, 1);
    d.setHours(0, 0, 0, 0);
    const next = new Date(d);
    next.setMonth(next.getMonth() + 1);

    const signups = accounts.filter(a => {
      const t = new Date(a.created_at);
      return t >= d && t < next;
    });
    const revenue = signups.reduce((sum, a) => {
      if (a.subscription_plan === "monthly") return sum + MONTHLY_PRICE;
      if (a.subscription_plan === "yearly")  return sum + YEARLY_PRICE;
      return sum;
    }, 0);

    months.push({
      label: d.toLocaleString("en-US", { month: "short" }),
      count: signups.length,
      revenue,
    });
  }
  return months;
}

function Sparkline({ data, color = "#7c3aed" }: { data: number[]; color?: string }) {
  const max = Math.max(...data, 1);
  const w = 180;
  const h = 48;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - (v / max) * (h - 4) - 2;
    return `${x},${y}`;
  });
  const areaPath = `M0,${h} L${pts[0].split(",")[0]},${pts[0].split(",")[1]} ${pts.map(p => `L${p}`).join(" ")} L${w},${h} Z`;

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      <defs>
        <linearGradient id={`g${color.slice(1)}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#g${color.slice(1)})`} />
      <polyline
        points={pts.join(" ")}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {data.map((v, i) => {
        const x = (i / (data.length - 1)) * w;
        const y = h - (v / max) * (h - 4) - 2;
        return <circle key={i} cx={x} cy={y} r="3" fill={color} />;
      })}
    </svg>
  );
}

function BarChart({ data, color = "#7c3aed" }: { data: { label: string; value: number }[]; color?: string }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end gap-2 h-20">
      {data.map((d, i) => (
        <div key={i} className="flex flex-col items-center gap-1 flex-1">
          <div
            className="w-full rounded-t-md transition-all"
            style={{
              height: `${Math.max((d.value / max) * 64, 2)}px`,
              background: color,
              opacity: 0.7 + (i / data.length) * 0.3,
            }}
          />
          <span className="text-[10px] text-neutral-600">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export default async function AnalyticsPage() {
  const { data: accounts } = await supabaseAdmin()
    .from("accounts")
    .select("subscription_status, subscription_plan, subscription_start_at, subscription_end_at, created_at")
    .order("created_at", { ascending: true });

  const accs = (accounts ?? []) as Account[];

  const mrr      = calcMRR(accs);
  const arr      = mrr * 12;
  const active   = accs.filter(a => a.subscription_status === "active").length;
  const trial    = accs.filter(a => a.subscription_status === "trial").length;
  const expired  = accs.filter(a => a.subscription_status === "expired").length;
  const total    = accs.length;
  const monthly  = accs.filter(a => a.subscription_status === "active" && a.subscription_plan === "monthly").length;
  const yearly   = accs.filter(a => a.subscription_status === "active" && a.subscription_plan === "yearly").length;

  const now      = new Date();
  const thisMonth = accs.filter(a => {
    const t = new Date(a.created_at);
    return t.getFullYear() === now.getFullYear() && t.getMonth() === now.getMonth();
  }).length;
  const lastMonth = accs.filter(a => {
    const t = new Date(a.created_at);
    const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return t.getFullYear() === lm.getFullYear() && t.getMonth() === lm.getMonth();
  }).length;

  const growth = lastMonth > 0 ? Math.round(((thisMonth - lastMonth) / lastMonth) * 100) : 0;

  const monthly6 = buildMonthlyGrowth(accs);
  const signupData = monthly6.map(m => m.count);


  const expiringIn7 = accs.filter(a => {
    if (a.subscription_status !== "active" || !a.subscription_end_at) return false;
    const end = new Date(a.subscription_end_at);
    const diff = end.getTime() - now.getTime();
    return diff > 0 && diff < 7 * 86400000;
  }).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="text-sm text-neutral-500 mt-1">Platform revenue and growth metrics</p>
      </div>

      {/* Revenue KPIs */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "MRR",  value: `₹${mrr.toLocaleString("en-IN")}`,   sub: "Monthly Recurring Revenue", color: "#7c3aed" },
          { label: "ARR",  value: `₹${arr.toLocaleString("en-IN")}`,   sub: "Annual Run Rate",           color: "#3b82f6" },
          { label: "Active", value: active,                              sub: `${monthly} monthly · ${yearly} yearly`, color: "#10b981" },
          { label: "Growth", value: `${growth > 0 ? "+" : ""}${growth}%`, sub: "vs last month",          color: growth >= 0 ? "#10b981" : "#f87171" },
        ].map(k => (
          <div key={k.label}
            className="rounded-xl p-5"
            style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <p className="text-xs text-neutral-500">{k.label}</p>
            <p className="text-2xl font-bold mt-1" style={{ color: k.color }}>{k.value}</p>
            <p className="text-xs text-neutral-600 mt-1">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Alerts */}
      {expiringIn7 > 0 && (
        <div className="rounded-xl p-4 flex items-center gap-3"
          style={{ background: "rgba(251,146,60,0.08)", border: "1px solid rgba(251,146,60,0.2)" }}>
          <span className="text-xl">⚠️</span>
          <div>
            <p className="text-sm font-semibold text-orange-300">
              {expiringIn7} subscription{expiringIn7 > 1 ? "s" : ""} expiring within 7 days
            </p>
            <p className="text-xs text-neutral-500">Visit Subscriptions page to extend them</p>
          </div>
        </div>
      )}

      {/* Charts row */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl p-5 space-y-3"
          style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-white">New Signups</p>
            <p className="text-xs text-neutral-500">Last 6 months</p>
          </div>
          <Sparkline data={signupData} color="#7c3aed" />
          <div className="flex gap-3 mt-1">
            {monthly6.map((m, i) => (
              <div key={i} className="flex flex-col items-center flex-1">
                <p className="text-[11px] font-semibold text-white">{m.count}</p>
                <p className="text-[10px] text-neutral-600">{m.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl p-5 space-y-3"
          style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-white">Revenue (₹)</p>
            <p className="text-xs text-neutral-500">Last 6 months</p>
          </div>
          <BarChart
            data={monthly6.map(m => ({ label: m.label, value: m.revenue }))}
            color="#3b82f6"
          />
        </div>
      </div>

      {/* Plan mix */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Monthly Plan", count: monthly, pct: active ? Math.round((monthly/active)*100) : 0, color: "#7c3aed", revenue: monthly * MONTHLY_PRICE },
          { label: "Yearly Plan",  count: yearly,  pct: active ? Math.round((yearly/active)*100) : 0,  color: "#3b82f6", revenue: yearly * YEARLY_PRICE },
          { label: "Trial / Free", count: trial,   pct: total  ? Math.round((trial/total)*100) : 0,    color: "#94a3b8", revenue: 0 },
        ].map(p => (
          <div key={p.label} className="rounded-xl p-5 space-y-3"
            style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-white">{p.label}</p>
              <span className="text-xs font-bold rounded-full px-2 py-0.5"
                style={{ background: `${p.color}1a`, color: p.color }}>
                {p.pct}%
              </span>
            </div>
            <p className="text-2xl font-bold text-white">{p.count}</p>
            <div className="h-1.5 w-full rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
              <div className="h-full rounded-full transition-all"
                style={{ width: `${p.pct}%`, background: p.color }} />
            </div>
            {p.revenue > 0 && (
              <p className="text-xs text-neutral-500">
                ₹{p.revenue.toLocaleString("en-IN")}/mo revenue
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Quick stats */}
      <div className="rounded-xl p-5"
        style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <p className="text-sm font-semibold text-white mb-4">Summary</p>
        <div className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-4">
          {[
            { label: "Total Accounts",      value: total },
            { label: "Paying Customers",     value: active },
            { label: "Trials",               value: trial },
            { label: "Churned / Expired",    value: expired },
            { label: "Expiring in 7 days",   value: expiringIn7 },
            { label: "Conversion Rate",      value: `${total > 0 ? Math.round((active/total)*100) : 0}%` },
            { label: "New This Month",       value: thisMonth },
            { label: "Last Month",           value: lastMonth },
          ].map(s => (
            <div key={s.label}>
              <p className="text-xs text-neutral-600">{s.label}</p>
              <p className="text-sm font-semibold text-white mt-0.5">{s.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
