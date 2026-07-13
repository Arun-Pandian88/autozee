"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { PresenceHeartbeat } from "@/components/presence/presence-heartbeat";
import {
  SubscriptionBanner,
  type BannerStatus,
} from "@/components/subscription/subscription-banner";

// Auth-gated dashboard shell. Extracted from the layout so the layout
// itself can stay a server component and export metadata (noindex) —
// client components can't export Next's metadata object.

interface DashboardShellProps {
  children: React.ReactNode;
  /** Server-resolved subscription status — passed from layout.tsx. */
  subscriptionStatus?: BannerStatus;
  /** ISO timestamp for trial countdown — only present when status=trial. */
  trialEndsAt?: string | null;
}

function DashboardShellInner({
  children,
  subscriptionStatus,
  trialEndsAt,
}: DashboardShellProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Sidebar drawer state — only used on mobile. On lg+ the sidebar is
  // always visible and this stays at `false` (ignored by the component).
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Reports this tab's online/away presence once we know a user is
          signed in. Headless — renders nothing. */}
      <PresenceHeartbeat />
      <Sidebar open={sidebarOpen} onClose={closeSidebar} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header onOpenSidebar={() => setSidebarOpen(true)} />
        {/* Subscription state banner — shown for trial/past_due/expired/cancelled */}
        <SubscriptionBanner
          status={subscriptionStatus}
          trialEndsAt={trialEndsAt}
        />
        {/* Thinner horizontal padding on mobile so cards have room to breathe. */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}

export function DashboardShell({
  children,
  subscriptionStatus,
  trialEndsAt,
}: DashboardShellProps) {
  return (
    <AuthProvider>
      <DashboardShellInner
        subscriptionStatus={subscriptionStatus}
        trialEndsAt={trialEndsAt}
      >
        {children}
      </DashboardShellInner>
    </AuthProvider>
  );
}
