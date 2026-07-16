"use client";

import { useState } from "react";
import Script from "next/script";

interface BillingClientProps {
  accountId: string;
  accountName: string;
  userName: string;
  currentStatus: string;
  currentPlan?: string;
}

const PRICES_INR: Record<string, { monthly: number; yearly: number }> = {
  basic:   { monthly: 499,   yearly: 4_790  },
  pro:     { monthly: 999,   yearly: 9_590  },
  premium: { monthly: 4_999, yearly: 47_990 },
};

function formatINR(n: number): string {
  return n.toLocaleString("en-IN");
}

export function BillingClient({
  accountId,
  accountName,
  currentStatus,
  currentPlan,
}: BillingClientProps) {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [cycle, setCycle] = useState<"monthly" | "yearly">("monthly");

  const currentTier = currentPlan?.split("_")[0] ?? null;

  const handleSubscribe = async (tier: string) => {
    const plan = `${tier}_${cycle}`;
    setLoadingPlan(plan);
    try {
      const res = await fetch("/api/billing/razorpay-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to create order");

      const { order } = data;

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Autozee",
        description: `${tier.charAt(0).toUpperCase() + tier.slice(1)} — ${cycle.charAt(0).toUpperCase() + cycle.slice(1)} subscription`,
        order_id: order.id,
        handler: async function() {
          try {
            if (process.env.NODE_ENV === "development") {
              const res = await fetch("/api/billing/sync-dev", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ plan })
              });
              if (!res.ok) {
                const errorText = await res.text();
                throw new Error(`Sync failed: ${res.status} - ${errorText}`);
              }
            }

            // Give local sync a moment before redirect
            setTimeout(() => {
              window.location.href = "/dashboard";
            }, 1500);
          } catch (error: any) {
            console.error("Payment sync failed:", error);
            alert("Payment succeeded but database update failed! Error: " + error.message);
            setLoadingPlan(null);
          }
        },
        prefill: { name: accountName },
        theme: { color: "#7c3aed" },
        notes: { account_id: accountId, plan },
      };

      if (!(window as any).Razorpay) {
        throw new Error("Razorpay SDK is still loading. Please try again.");
      }

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        alert(`Payment failed: ${response.error.description}`);
      });
      rzp.open();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoadingPlan(null);
    }
  };

  const plans = [
    {
      tier: "basic",
      name: "Basic",
      tagline: "Essential WhatsApp tools for solo operators.",
      color: "rgba(255,255,255,0.03)",
      border: "rgba(255,255,255,0.1)",
      featured: false,
      features: [
        { yes: true,  text: "Unlimited contacts" },
        { yes: true,  text: "Shared inbox (1 seat)" },
        { yes: true,  text: "1 chatbot flow (keyword-based)" },
        { yes: true,  text: "Business-hours auto-reply" },
        { yes: true,  text: "Welcome message automation" },
        { yes: true,  text: "Fixed FAQ auto-reply (5–10 Q&A)" },
        { yes: false, text: "Broadcasts" },
        { yes: false, text: "Drip / follow-up automation" },
        { yes: false, text: "Unlimited chatbot flows" },
        { yes: false, text: "AI auto-reply" },
      ],
    },
    {
      tier: "pro",
      name: "Pro",
      tagline: "For growing teams that automate customer journeys.",
      color: "linear-gradient(180deg, rgba(124,58,237,0.1) 0%, rgba(10,12,20,0) 100%)",
      border: "rgba(124,58,237,0.4)",
      featured: true,
      features: [
        { yes: true,  text: "Up to 5,000 contacts" },
        { yes: true,  text: "3 team seats" },
        { yes: true,  text: "1,000 broadcast messages/month" },
        { yes: true,  text: "Unlimited chatbot flows (multi-step, button menus)" },
        { yes: true,  text: "Drip / follow-up automation" },
        { yes: true,  text: "Keyword-based auto-tagging" },
        { yes: true,  text: "Abandoned-inquiry recovery" },
        { yes: true,  text: "Everything in Basic" },
        { yes: false, text: "AI auto-reply" },
        { yes: false, text: "Lead scoring" },
      ],
    },
    {
      tier: "premium",
      name: "Premium",
      tagline: "AI-powered growth for high-volume businesses.",
      color: "rgba(255,255,255,0.02)",
      border: "rgba(255,255,255,0.1)",
      featured: false,
      features: [
        { yes: true,  text: "Up to 20,000 contacts" },
        { yes: true,  text: "10 team seats" },
        { yes: true,  text: "2,000 broadcast messages/month" },
        { yes: true,  text: "AI auto-reply (FAQ knowledge base)" },
        { yes: true,  text: "Lead scoring automation" },
        { yes: true,  text: "Multi-number bot routing (sales vs support)" },
        { yes: true,  text: "Festival / birthday auto-campaigns" },
        { yes: true,  text: "Click-to-WhatsApp Ads automation" },
        { yes: true,  text: "Everything in Pro" },
        { yes: true,  text: "Priority 24/7 support" },
      ],
    },
  ];

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />

      {/* Active subscription notice */}
      {currentStatus === "active" && (
        <div className="mb-8 rounded-xl p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-center max-w-2xl w-full mx-auto text-sm">
          <span className="font-semibold">✓ Your {currentPlan?.split('_')[0].toUpperCase()} subscription is active.</span>{" "}
          You can manage or upgrade your plan below.
        </div>
      )}

      {/* Billing cycle toggle */}
      <div className="flex justify-center mb-12">
        <div className="inline-flex items-center rounded-full p-1 bg-white/5 border border-white/10">
          <button
            onClick={() => setCycle("monthly")}
            className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
              cycle === "monthly"
                ? "bg-violet-600 text-white shadow-lg"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setCycle("yearly")}
            className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
              cycle === "yearly"
                ? "bg-violet-600 text-white shadow-lg"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Yearly <span className="ml-1 text-emerald-400 font-bold">-20%</span>
          </button>
        </div>
      </div>

      {/* Plan cards */}
      <div className="grid lg:grid-cols-3 gap-6 w-full max-w-6xl">
        {plans.map((plan) => {
          const basePrice =
            cycle === "monthly"
              ? PRICES_INR[plan.tier].monthly
              : PRICES_INR[plan.tier].yearly;
          const price = Math.round(basePrice * 1.15);
          const isCurrentPlan = currentTier === plan.tier;
          const planKey = `${plan.tier}_${cycle}`;

          return (
            <div
              key={plan.tier}
              className="relative flex flex-col rounded-2xl p-8 transition-transform hover:-translate-y-1"
              style={{
                background: plan.color,
                border: `1px solid ${plan.border}`,
                boxShadow: plan.featured
                  ? "0 0 40px rgba(124,58,237,0.15)"
                  : undefined,
              }}
            >
              {plan.featured && (
                <div className="absolute -top-4 left-0 right-0 flex justify-center">
                  <span className="rounded-full bg-violet-600 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-lg shadow-violet-600/30">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-1.5">
                  {plan.name}
                </h3>
                <p
                  className="text-sm"
                  style={{
                    color: plan.featured
                      ? "rgba(196,181,253,0.7)"
                      : "rgba(163,163,163,0.8)",
                  }}
                >
                  {plan.tagline}
                </p>
              </div>

              <div className="mb-6 flex items-baseline text-white">
                <span className="text-4xl font-extrabold tracking-tight">
                  ₹{formatINR(price)}
                </span>
                <span className="ml-2 text-sm font-medium text-neutral-500">
                  /{cycle === "monthly" ? "mo" : "yr"}
                </span>
                {cycle === "yearly" && (
                  <span className="ml-2 text-xs text-emerald-400 font-semibold">
                    Save 20%
                  </span>
                )}
              </div>
              <div className="text-xs text-neutral-500 mb-6 -mt-4">
                Includes 15% markup fee
              </div>

              <ul className="mb-8 space-y-3 flex-1 text-sm">
                {plan.features.map((f, i) => (
                  <li
                    key={i}
                    className="flex gap-2.5"
                    style={{
                      color: f.yes
                        ? "rgba(212,212,212,0.9)"
                        : "rgba(115,115,115,0.6)",
                    }}
                  >
                    <span
                      className="font-bold shrink-0"
                      style={{
                        color: f.yes
                          ? plan.featured
                            ? "#a78bfa"
                            : "#34d399"
                          : "rgba(115,115,115,0.4)",
                      }}
                    >
                      {f.yes ? "✓" : "✕"}
                    </span>
                    {f.text}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(plan.tier)}
                disabled={!!loadingPlan || isCurrentPlan}
                className="w-full rounded-xl py-3.5 px-4 text-sm font-semibold transition-all disabled:opacity-50"
                style={
                  plan.featured
                    ? {
                        background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
                        color: "#fff",
                        boxShadow: "0 4px 20px rgba(124,58,237,0.4)",
                      }
                    : {
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        color: "#fff",
                      }
                }
              >
                {loadingPlan === planKey
                  ? "Processing…"
                  : isCurrentPlan
                  ? "Current plan"
                  : `Choose ${plan.name}`}
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
}
