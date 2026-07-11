import { redirect } from "next/navigation";
import { getCurrentAccount } from "@/lib/auth/account";
import { BillingClient } from "./billing-client";
import { LogOut } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Billing — Autozee" };

export default async function BillingPage() {
  const ctx = await getCurrentAccount().catch(() => null);
  
  if (!ctx) {
    redirect("/login");
  }

  // Only owners should ideally pay, but we can let any authenticated user of the account see it.
  // Actually, we should probably restrict paying to the owner or admin.
  // For simplicity, we just pass the context.

  return (
    <div className="flex min-h-screen flex-col bg-[#05070d] text-neutral-200">
      {/* Background Glow */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(circle at 50% 0%, rgba(124,58,237,0.1), transparent 50%)",
        }}
      />

      <header className="relative z-10 flex h-16 items-center justify-between px-6 border-b border-white/5 bg-black/20 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl text-white font-black text-sm"
            style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)", boxShadow: "0 4px 20px rgba(124,58,237,0.4)" }}>
            Az
          </div>
          <span className="font-bold text-white">Autozee</span>
        </div>
        <div className="flex items-center gap-4">
          <a href="/dashboard" className="text-sm font-medium text-neutral-400 hover:text-white transition-colors">
            Dashboard
          </a>
          <form action="/api/auth/signout" method="POST">
            <button type="submit" className="flex items-center gap-2 text-sm font-medium text-neutral-400 hover:text-white transition-colors">
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </form>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-4xl text-center space-y-4 mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
            Choose your plan
          </h1>
          <p className="text-lg text-neutral-400 max-w-xl mx-auto">
            Upgrade your workspace subscription to unlock all premium features and continue growing your business with Autozee.
          </p>
        </div>

        <BillingClient 
          accountId={ctx.accountId} 
          accountName={ctx.account.name} 
          userName={ctx.userId} // could pass profile name if fetched
          currentStatus={ctx.subscriptionStatus} 
        />
      </main>
    </div>
  );
}
