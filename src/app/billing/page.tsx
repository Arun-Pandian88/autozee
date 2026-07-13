import { redirect } from "next/navigation";
import { getCurrentAccount } from "@/lib/auth/account";
import { BillingClient } from "./billing-client";
import { DashboardShell } from "@/app/(dashboard)/dashboard-shell";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Billing — Autozee" };

export default async function BillingPage() {
  const ctx = await getCurrentAccount().catch(() => null);
  
  if (!ctx) {
    redirect("/login");
  }

  return (
    <DashboardShell
      subscriptionStatus={ctx?.subscriptionStatus ?? null}
      trialEndsAt={ctx?.trialEndsAt ?? null}
    >
      <main className="flex-1 overflow-y-auto bg-background p-6 lg:p-8">
        <div className="mx-auto max-w-5xl space-y-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Billing & Subscription
            </h1>
            <p className="text-muted-foreground mt-2">
              Upgrade your workspace subscription to unlock all premium features and continue growing your business with Autozee.
            </p>
          </div>

          <BillingClient 
            accountId={ctx.accountId} 
            accountName={ctx.account.name} 
            userName={ctx.userId}
            currentStatus={ctx.subscriptionStatus}
            currentPlan={ctx.subscriptionPlan}
          />
        </div>
      </main>
    </DashboardShell>
  );
}
