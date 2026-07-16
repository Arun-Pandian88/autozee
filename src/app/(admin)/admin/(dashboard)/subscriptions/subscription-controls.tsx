"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Download } from "lucide-react";

type Status = "trial" | "active" | "inactive" | "expired";
type Plan = string; // "free" | "basic_monthly" | "pro_yearly" | ...

const STATUS_STYLES: Record<Status, { label: string; color: string; bg: string; border: string }> = {
  trial:    { label: "Trial",    color: "#60a5fa", bg: "rgba(59,130,246,0.1)",  border: "rgba(59,130,246,0.2)"  },
  active:   { label: "Active",   color: "#34d399", bg: "rgba(16,185,129,0.1)",  border: "rgba(16,185,129,0.2)"  },
  inactive: { label: "Inactive", color: "#fb923c", bg: "rgba(251,146,60,0.1)",  border: "rgba(251,146,60,0.2)"  },
  expired:  { label: "Expired",  color: "#f87171", bg: "rgba(239,68,68,0.1)",   border: "rgba(239,68,68,0.2)"   },
};

export function StatusBadge({ status }: { status: Status }) {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES.trial;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.color }} />
      {s.label}
    </span>
  );
}

export function ExportButton({ type }: { type: "subscriptions" | "users" }) {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/export?type=${type}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `autozee-${type}-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleExport} disabled={loading}
      className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium transition-all disabled:opacity-50"
      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(148,163,184,0.8)" }}>
      <Download className="h-3.5 w-3.5" />
      {loading ? "Exporting…" : "Export CSV"}
    </button>
  );
}

export function SubscriptionControls({
  accountId,
  currentStatus,
  currentPlan,
  endDate,
  currentNotes,
}: {
  accountId: string;
  currentStatus: Status;
  currentPlan: Plan;
  endDate: string | null;
  currentNotes?: string | null;
}) {
  const [status, setStatus]     = useState<Status>(currentStatus);
  const [, setPlan]             = useState<Plan>(currentPlan);
  const [customDays, setCustomDays] = useState("30");
  const [notes, setNotes]       = useState(currentNotes ?? "");
  const [showExtend, setShowExtend] = useState(false);
  const [showActivate, setShowActivate] = useState(false);
  const [selectedPlanToActivate, setSelectedPlanToActivate] = useState("pro_monthly");
  const [loading, setLoading]   = useState(false);
  const [saved, setSaved]       = useState(false);
  const router = useRouter();

  const patch = async (body: Record<string, unknown>) => {
    setLoading(true);
    setSaved(false);
    await fetch(`/api/admin/subscriptions/${accountId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setSaved(true);
    setLoading(false);
    setTimeout(() => setSaved(false), 2000);
    router.refresh();
  };

  const activate = async () => {
    const months = selectedPlanToActivate.includes("yearly") ? 12 : 1;
    const start = new Date();
    const end   = new Date(start);
    end.setMonth(end.getMonth() + months);
    setStatus("active");
    setPlan(selectedPlanToActivate);
    await patch({
      subscription_status: "active",
      subscription_plan: selectedPlanToActivate,
      subscription_start_at: start.toISOString(),
      subscription_end_at: end.toISOString(),
      subscription_source: "manual",
      subscription_notes: notes || null,
    });
    setShowActivate(false);
  };

  const extend = async () => {
    const days = parseInt(customDays, 10);
    if (isNaN(days) || days < 1) return;
    const base = endDate ? new Date(endDate) : new Date();
    if (base < new Date()) base.setTime(Date.now());
    base.setDate(base.getDate() + days);
    await patch({
      subscription_status: "active",
      subscription_end_at: base.toISOString(),
      subscription_notes: notes || null,
    });
    setShowExtend(false);
  };

  const deactivate = async () => {
    setStatus("inactive");
    await patch({ subscription_status: "inactive", subscription_notes: notes || null });
  };

  const resetTrial = async () => {
    setStatus("trial");
    setPlan("free");
    await patch({ subscription_status: "trial", subscription_plan: "free", subscription_start_at: null, subscription_end_at: null });
  };

  const btnBase = "rounded-lg px-3 py-1.5 text-xs font-medium transition-all disabled:opacity-50 whitespace-nowrap";

  return (
    <div className="space-y-3">
      {/* Status + actions row */}
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status={status} />

        {status !== "active" && (
          <button disabled={loading} onClick={() => setShowActivate(!showActivate)}
            className={btnBase}
            style={{ background: "rgba(16,185,129,0.12)", color: "#34d399", border: "1px solid rgba(16,185,129,0.2)" }}>
            ✓ Activate
          </button>
        )}

        {status === "active" && (
          <>
            <button disabled={loading} onClick={() => setShowExtend(v => !v)}
              className={btnBase}
              style={{ background: "rgba(59,130,246,0.12)", color: "#60a5fa", border: "1px solid rgba(59,130,246,0.2)" }}>
              ⊕ Extend
            </button>
            <button disabled={loading} onClick={deactivate}
              className={btnBase}
              style={{ background: "rgba(251,146,60,0.1)", color: "#fb923c", border: "1px solid rgba(251,146,60,0.2)" }}>
              ✕ Deactivate
            </button>
          </>
        )}

        {status !== "trial" && (
          <button disabled={loading} onClick={resetTrial}
            className={btnBase}
            style={{ background: "rgba(255,255,255,0.05)", color: "rgba(148,163,184,0.6)", border: "1px solid rgba(255,255,255,0.08)" }}>
            ↺ Reset Trial
          </button>
        )}

        {loading && <span className="text-xs text-neutral-600">Saving…</span>}
        {saved && <span className="text-xs font-medium" style={{ color: "#34d399" }}>✓ Saved</span>}
      </div>

      {/* Activate panel */}
      {showActivate && (
        <div className="flex items-center gap-2 flex-wrap rounded-xl p-3"
          style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.15)" }}>
          <select 
            value={selectedPlanToActivate}
            onChange={(e) => setSelectedPlanToActivate(e.target.value)}
            className="rounded-lg px-2 py-1 text-xs text-white outline-none"
            style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}>
            <option value="basic_monthly">Basic Monthly</option>
            <option value="basic_yearly">Basic Yearly</option>
            <option value="pro_monthly">Pro Monthly</option>
            <option value="pro_yearly">Pro Yearly</option>
            <option value="premium_monthly">Premium Monthly</option>
            <option value="premium_yearly">Premium Yearly</option>
          </select>
          <button disabled={loading} onClick={activate}
            className={`${btnBase}`}
            style={{ background: "rgba(16,185,129,0.15)", color: "#34d399", border: "1px solid rgba(16,185,129,0.25)" }}>
            Start Subscription
          </button>
          <button onClick={() => setShowActivate(false)}
            className="text-xs text-neutral-600 hover:text-neutral-400 transition-colors ml-1">
            Cancel
          </button>
        </div>
      )}

      {/* Custom extend panel */}
      {showExtend && (
        <div className="flex items-center gap-2 flex-wrap rounded-xl p-3"
          style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.15)" }}>
          <span className="text-xs text-neutral-400">Extend by</span>
          <input type="number" min="1" max="3650" value={customDays}
            onChange={e => setCustomDays(e.target.value)}
            className="w-16 rounded-lg px-2 py-1 text-xs text-white outline-none"
            style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }} />
          <span className="text-xs text-neutral-400">days</span>
          <button disabled={loading} onClick={extend}
            className={`${btnBase}`}
            style={{ background: "rgba(59,130,246,0.15)", color: "#60a5fa", border: "1px solid rgba(59,130,246,0.25)" }}>
            Apply
          </button>
          <button onClick={() => setShowExtend(false)}
            className="text-xs text-neutral-600 hover:text-neutral-400 transition-colors ml-1">
            Cancel
          </button>
        </div>
      )}

      {/* Notes */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Admin notes (optional)…"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          onBlur={() => notes !== (currentNotes ?? "") && patch({ subscription_notes: notes || null })}
          className="flex-1 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-neutral-600 outline-none transition-all"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
        />
      </div>
    </div>
  );
}
