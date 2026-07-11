"use client";

import { useState } from "react";
import Script from "next/script";

interface BillingClientProps {
  accountId: string;
  accountName: string;
  userName: string;
  currentStatus: string;
}

export function BillingClient({ accountId, accountName, userName, currentStatus }: BillingClientProps) {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [cycle, setCycle] = useState<"monthly" | "yearly">("monthly");

  const handleSubscribe = async (tier: string) => {
    const plan = `${tier}_${cycle}`;
    setLoadingPlan(plan);
    try {
      // 1. Create order on server
      const res = await fetch("/api/billing/razorpay-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Failed to create order");
      
      const { order } = data;

      // 2. Initialize Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, 
        amount: order.amount, 
        currency: order.currency,
        name: "Autozee",
        description: `${tier.toUpperCase()} - ${cycle.toUpperCase()} Subscription for ${accountName}`,
        order_id: order.id, 
        handler: function (response: any) {
          // 3. Payment success — redirect to dashboard
          window.location.href = "/dashboard?payment_success=true";
        },
        prefill: {
          name: accountName,
        },
        theme: {
          color: "#7c3aed",
        },
      };

      if (!(window as any).Razorpay) {
        throw new Error("Razorpay SDK is still loading. Please try again in a few seconds.");
      }

      const rzp1 = new (window as any).Razorpay(options);
      rzp1.on("payment.failed", function (response: any) {
        alert(`Payment Failed: ${response.error.description}`);
      });
      rzp1.open();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      
      {currentStatus === "active" && (
        <div className="mb-8 rounded-xl p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-center max-w-2xl w-full mx-auto">
          <span className="font-semibold">✓ Your subscription is currently Active.</span> You can upgrade your plan below.
        </div>
      )}

      {/* Cycle Toggle */}
      <div className="flex justify-center mb-12">
        <div className="inline-flex items-center rounded-full p-1 bg-white/5 border border-white/10">
          <button onClick={() => setCycle("monthly")}
            className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${cycle === "monthly" ? "bg-violet-600 text-white shadow-lg" : "text-neutral-400 hover:text-white"}`}>
            Monthly
          </button>
          <button onClick={() => setCycle("yearly")}
            className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${cycle === "yearly" ? "bg-violet-600 text-white shadow-lg" : "text-neutral-400 hover:text-white"}`}>
            Yearly <span className="ml-1 text-emerald-400 font-bold">-20%</span>
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 w-full max-w-6xl">
        {/* Basic Tier */}
        <div className="relative flex flex-col rounded-2xl p-8 transition-transform hover:-translate-y-1 bg-white/[0.02] border border-white/10">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-white mb-2">Basic</h3>
            <p className="text-sm text-neutral-400">Essential tools to manage your contacts.</p>
          </div>
          <div className="mb-6 flex items-baseline text-white">
            <span className="text-5xl font-extrabold tracking-tight">₹{cycle === "monthly" ? "499" : "4,790"}</span>
            <span className="ml-2 text-sm font-medium text-neutral-500">/{cycle === "monthly" ? "mo" : "yr"}</span>
          </div>
          <ul className="mb-8 space-y-4 flex-1 text-sm text-neutral-300">
            <li className="flex gap-3"><span className="text-emerald-400">✓</span> Unlimited Contacts</li>
            <li className="flex gap-3"><span className="text-emerald-400">✓</span> Basic Shared Inbox</li>
            <li className="flex gap-3"><span className="text-emerald-400">✓</span> Analytics Dashboard</li>
            <li className="flex gap-3 text-neutral-600"><span className="text-neutral-600">✕</span> Automations</li>
            <li className="flex gap-3 text-neutral-600"><span className="text-neutral-600">✕</span> Broadcasts</li>
          </ul>
          <button
            onClick={() => handleSubscribe("basic")}
            disabled={!!loadingPlan}
            className="w-full rounded-xl py-3.5 px-4 text-sm font-semibold transition-all disabled:opacity-50 bg-white/5 border border-white/10 text-white hover:bg-white/10"
          >
            {loadingPlan === `basic_${cycle}` ? "Processing…" : "Choose Basic"}
          </button>
        </div>

        {/* Pro Tier */}
        <div className="relative flex flex-col rounded-2xl p-8 shadow-2xl transition-transform hover:-translate-y-1"
          style={{ background: "linear-gradient(180deg, rgba(124,58,237,0.1) 0%, rgba(10,12,20,0) 100%)", border: "1px solid rgba(124,58,237,0.4)" }}>
          <div className="absolute -top-4 left-0 right-0 flex justify-center">
            <span className="rounded-full bg-violet-600 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-lg shadow-violet-600/30">
              Most Popular
            </span>
          </div>
          <div className="mb-6">
            <h3 className="text-xl font-bold text-white mb-2">Pro</h3>
            <p className="text-sm text-violet-300/70">Perfect for growing teams automating tasks.</p>
          </div>
          <div className="mb-6 flex items-baseline text-white">
            <span className="text-5xl font-extrabold tracking-tight">₹{cycle === "monthly" ? "999" : "9,590"}</span>
            <span className="ml-2 text-sm font-medium text-neutral-500">/{cycle === "monthly" ? "mo" : "yr"}</span>
          </div>
          <ul className="mb-8 space-y-4 flex-1 text-sm text-neutral-300">
            <li className="flex gap-3"><span className="text-emerald-400">✓</span> Everything in Basic</li>
            <li className="flex gap-3"><span className="text-emerald-400">✓</span> Smart Automations & Flows</li>
            <li className="flex gap-3"><span className="text-emerald-400">✓</span> Template Broadcasts</li>
            <li className="flex gap-3 text-neutral-600"><span className="text-neutral-600">✕</span> AI Assistant</li>
          </ul>
          <button
            onClick={() => handleSubscribe("pro")}
            disabled={!!loadingPlan}
            className="w-full rounded-xl py-3.5 px-4 text-sm font-semibold text-white transition-all disabled:opacity-50 shadow-lg"
            style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}
          >
            {loadingPlan === `pro_${cycle}` ? "Processing…" : "Choose Pro"}
          </button>
        </div>

        {/* Premium Tier */}
        <div className="relative flex flex-col rounded-2xl p-8 transition-transform hover:-translate-y-1 bg-white/[0.02] border border-white/10">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-white mb-2">Premium</h3>
            <p className="text-sm text-neutral-400">All features unlocked with AI.</p>
          </div>
          <div className="mb-6 flex items-baseline text-white">
            <span className="text-5xl font-extrabold tracking-tight">₹{cycle === "monthly" ? "2,499" : "23,990"}</span>
            <span className="ml-2 text-sm font-medium text-neutral-500">/{cycle === "monthly" ? "mo" : "yr"}</span>
          </div>
          <ul className="mb-8 space-y-4 flex-1 text-sm text-neutral-300">
            <li className="flex gap-3"><span className="text-emerald-400">✓</span> Everything in Pro</li>
            <li className="flex gap-3"><span className="text-emerald-400">✓</span> AI Auto-Replies</li>
            <li className="flex gap-3"><span className="text-emerald-400">✓</span> AI Knowledge Base</li>
            <li className="flex gap-3"><span className="text-emerald-400">✓</span> Priority 24/7 Support</li>
          </ul>
          <button
            onClick={() => handleSubscribe("premium")}
            disabled={!!loadingPlan}
            className="w-full rounded-xl py-3.5 px-4 text-sm font-semibold transition-all disabled:opacity-50 bg-white/5 border border-white/10 text-white hover:bg-white/10"
          >
            {loadingPlan === `premium_${cycle}` ? "Processing…" : "Choose Premium"}
          </button>
        </div>
      </div>
    </>
  );
}
