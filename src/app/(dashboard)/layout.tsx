import type { Metadata } from "next";
import { DashboardShell } from "./dashboard-shell";

import { getCurrentAccount } from "@/lib/auth/account";
import { LogOut } from "lucide-react";

// Server layout whose only job is to declare "do not index" metadata
// for the authed app. robots.ts already disallows these paths at the
// crawler-level and middleware redirects unauthenticated visitors, so
// this is belt-and-suspenders — but SEO-critical if a URL ever leaks
// via a link shared externally.
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ctx = await getCurrentAccount().catch(() => null);

  if (ctx && (ctx.subscriptionStatus === "inactive" || ctx.subscriptionStatus === "expired") && !ctx.isSuperAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
        <div className="w-full max-w-md rounded-2xl border bg-card p-8 shadow-sm text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-orange-500/10 mb-4">
            <span className="text-xl">⚠️</span>
          </div>
          <h1 className="text-xl font-bold text-card-foreground">Subscription Inactive</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Your workspace subscription is currently {ctx.subscriptionStatus}. Please upgrade your plan to restore access.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4">
            <a href="/billing" className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90">
              Upgrade Plan
            </a>
             <form action="/api/auth/signout" method="POST">
               <button type="submit" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-2 transition-colors">
                 <LogOut className="h-4 w-4" /> Sign out
               </button>
             </form>
          </div>
        </div>
      </div>
    );
  }

  return <DashboardShell>{children}</DashboardShell>;
}
