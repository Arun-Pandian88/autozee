"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X, AlertTriangle, Clock, CreditCard, Ban } from "lucide-react";

// ---------------------------------------------------------------------------
// SubscriptionBanner
//
// Persistent top-of-dashboard banner driven by the account's subscription
// state. Renders nothing for active accounts.
//
// Banner states:
//   trial     — blue/amber countdown ("N days left in trial")
//   past_due  — red "Payment failed — update method"
//   expired   — red "Subscription expired — reactivate"
//   cancelled — red "Account cancelled — read-only"
// ---------------------------------------------------------------------------

export type BannerStatus =
  | "trial"
  | "past_due"
  | "expired"
  | "cancelled"
  | "inactive" // legacy — shown as expired
  | "active"
  | null
  | undefined;

interface SubscriptionBannerProps {
  status: BannerStatus;
  /**
   * ISO 8601 timestamp of when the trial ends.
   * Only needed (and used) when status === "trial".
   */
  trialEndsAt?: string | null;
}

function getDaysRemaining(isoDate: string): number {
  const end = new Date(isoDate).getTime();
  const now = Date.now();
  return Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)));
}

export function SubscriptionBanner({
  status,
  trialEndsAt,
}: SubscriptionBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const [daysLeft, setDaysLeft] = useState<number | null>(null);

  useEffect(() => {
    if (status === "trial" && trialEndsAt) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDaysLeft(getDaysRemaining(trialEndsAt));
      // Recalculate once per minute in long-running tabs
      const id = setInterval(() => {
        setDaysLeft(getDaysRemaining(trialEndsAt));
      }, 60_000);
      return () => clearInterval(id);
    }
  }, [status, trialEndsAt]);

  // Nothing to show for active accounts or after dismissal
  if (!status || status === "active" || dismissed) return null;

  // ── Trial banner ──────────────────────────────────────────────────────────
  if (status === "trial") {
    const urgentDays = daysLeft !== null && daysLeft <= 2;
    return (
      <div
        className="relative flex items-center justify-between gap-3 px-4 py-2.5 text-sm font-medium"
        style={{
          background: urgentDays
            ? "linear-gradient(90deg, rgba(245,158,11,0.15), rgba(245,158,11,0.08))"
            : "linear-gradient(90deg, rgba(139,92,246,0.15), rgba(99,102,241,0.08))",
          borderBottom: urgentDays
            ? "1px solid rgba(245,158,11,0.25)"
            : "1px solid rgba(139,92,246,0.2)",
        }}
      >
        <div className="flex items-center gap-2.5">
          <Clock
            className="h-4 w-4 shrink-0"
            style={{ color: urgentDays ? "#f59e0b" : "#a78bfa" }}
          />
          <span style={{ color: urgentDays ? "#fcd34d" : "#c4b5fd" }}>
            {daysLeft === null ? (
              "You're on a free trial."
            ) : daysLeft === 0 ? (
              <><strong>Your trial ends today.</strong> Pick a plan to keep access.</>
            ) : daysLeft === 1 ? (
              <><strong>1 day left</strong> in your free trial.</>
            ) : (
              <><strong>{daysLeft} days left</strong> in your free trial.</>
            )}
          </span>
          <Link
            href="/billing"
            className="inline-flex items-center rounded-full px-3 py-0.5 text-xs font-semibold transition-all hover:opacity-80"
            style={{
              background: urgentDays
                ? "rgba(245,158,11,0.2)"
                : "rgba(139,92,246,0.25)",
              color: urgentDays ? "#fcd34d" : "#c4b5fd",
              border: urgentDays
                ? "1px solid rgba(245,158,11,0.3)"
                : "1px solid rgba(139,92,246,0.3)",
            }}
          >
            Choose a plan →
          </Link>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="rounded p-0.5 opacity-50 hover:opacity-100 transition-opacity"
          style={{ color: urgentDays ? "#f59e0b" : "#a78bfa" }}
          aria-label="Dismiss banner"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  // ── Past-due banner ───────────────────────────────────────────────────────
  if (status === "past_due") {
    return (
      <div
        className="relative flex items-center justify-between gap-3 px-4 py-2.5 text-sm font-medium"
        style={{
          background: "linear-gradient(90deg, rgba(239,68,68,0.12), rgba(239,68,68,0.06))",
          borderBottom: "1px solid rgba(239,68,68,0.25)",
        }}
      >
        <div className="flex items-center gap-2.5">
          <CreditCard className="h-4 w-4 shrink-0 text-red-400" />
          <span className="text-red-300">
            <strong>Payment failed.</strong> Your account will be suspended when
            the grace period ends.
          </span>
          <Link
            href="/billing"
            className="inline-flex items-center rounded-full px-3 py-0.5 text-xs font-semibold bg-red-500/20 border border-red-500/30 text-red-300 hover:bg-red-500/30 transition-colors"
          >
            Update payment method →
          </Link>
        </div>
        {/* past_due is not dismissable — too important */}
      </div>
    );
  }

  // ── Expired banner ────────────────────────────────────────────────────────
  if (status === "expired" || status === "inactive") {
    return (
      <div
        className="relative flex items-center justify-between gap-3 px-4 py-2.5 text-sm font-medium"
        style={{
          background: "linear-gradient(90deg, rgba(239,68,68,0.15), rgba(239,68,68,0.07))",
          borderBottom: "1px solid rgba(239,68,68,0.3)",
        }}
      >
        <div className="flex items-center gap-2.5">
          <AlertTriangle className="h-4 w-4 shrink-0 text-red-400" />
          <span className="text-red-300">
            <strong>Subscription expired.</strong> Your account is in read-only
            mode — you can view data but cannot send messages or make changes.
          </span>
          <Link
            href="/billing"
            className="inline-flex items-center rounded-full px-3 py-0.5 text-xs font-semibold bg-red-500/20 border border-red-500/30 text-red-300 hover:bg-red-500/30 transition-colors"
          >
            Reactivate →
          </Link>
        </div>
      </div>
    );
  }

  // ── Cancelled banner ──────────────────────────────────────────────────────
  if (status === "cancelled") {
    return (
      <div
        className="relative flex items-center justify-between gap-3 px-4 py-2.5 text-sm font-medium"
        style={{
          background: "linear-gradient(90deg, rgba(239,68,68,0.15), rgba(239,68,68,0.07))",
          borderBottom: "1px solid rgba(239,68,68,0.3)",
        }}
      >
        <div className="flex items-center gap-2.5">
          <Ban className="h-4 w-4 shrink-0 text-red-400" />
          <span className="text-red-300">
            <strong>Account cancelled</strong> — read-only mode. Your data is
            retained for 30 days.
          </span>
          <Link
            href="/billing"
            className="inline-flex items-center rounded-full px-3 py-0.5 text-xs font-semibold bg-red-500/20 border border-red-500/30 text-red-300 hover:bg-red-500/30 transition-colors"
          >
            Reactivate →
          </Link>
        </div>
      </div>
    );
  }

  return null;
}
