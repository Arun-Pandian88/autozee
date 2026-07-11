"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Users,
  Activity,
  Settings,
  CreditCard,
} from "lucide-react";

const navItems = [
  {
    group: "Platform",
    items: [
      { href: "/admin", icon: <LayoutDashboard className="h-4 w-4" />, label: "Overview", exact: true },
      { href: "/admin/workspaces", icon: <Building2 className="h-4 w-4" />, label: "Workspaces" },
      { href: "/admin/users", icon: <Users className="h-4 w-4" />, label: "Users" },
      { href: "/admin/subscriptions", icon: <CreditCard className="h-4 w-4" />, label: "Subscriptions" },
    ],
  },
  {
    group: "System",
    items: [
      { href: "/admin/logs", icon: <Activity className="h-4 w-4" />, label: "Activity Logs" },
      { href: "/admin/settings", icon: <Settings className="h-4 w-4" />, label: "Settings" },
    ],
  },
];

export default function AdminSidebar({
  adminName,
}: {
  adminName: string;
}) {
  const pathname = usePathname();

  const isActive = (href: string, exact = false) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <aside
      className="relative z-10 flex w-64 flex-col shrink-0"
      style={{
        background: "rgba(8,10,18,0.8)",
        backdropFilter: "blur(20px)",
        borderRight: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      {/* Logo */}
      <div className="flex h-16 items-center px-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-xl text-white font-black text-sm"
            style={{
              background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
              boxShadow: "0 4px 20px rgba(124,58,237,0.4)",
            }}
          >
            Az
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-none">Autozee</p>
            <p className="text-[10px] font-semibold uppercase tracking-widest mt-0.5" style={{ color: "#a78bfa" }}>
              Super Admin
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-6 overflow-y-auto">
        {navItems.map((group) => (
          <div key={group.group}>
            <p className="px-3 text-[10px] font-semibold uppercase tracking-widest text-neutral-600 mb-2">
              {group.group}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(item.href, item.exact);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                      active
                        ? "text-violet-300"
                        : "text-neutral-500 hover:text-neutral-200"
                    }`}
                    style={
                      active
                        ? {
                            background: "rgba(124,58,237,0.12)",
                            border: "1px solid rgba(124,58,237,0.15)",
                          }
                        : { border: "1px solid transparent" }
                    }
                  >
                    <span
                      className={`transition-colors ${
                        active
                          ? "text-violet-400"
                          : "text-neutral-600 group-hover:text-neutral-400"
                      }`}
                    >
                      {item.icon}
                    </span>
                    {item.label}
                    {active && (
                      <span
                        className="ml-auto h-1.5 w-1.5 rounded-full"
                        style={{ background: "#a78bfa" }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-white/5">
        <div
          className="flex items-center gap-3 rounded-xl p-3"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}
        >
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold"
            style={{
              background: "rgba(124,58,237,0.15)",
              border: "1px solid rgba(124,58,237,0.2)",
              color: "#a78bfa",
            }}
          >
            {adminName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium text-white truncate">{adminName}</p>
            <Link
              href="/admin/login"
              onClick={async (e) => {
                e.preventDefault();
                const { createClient } = await import("@/lib/supabase/client");
                await createClient().auth.signOut();
                window.location.href = "/admin/login";
              }}
              className="text-xs text-neutral-600 hover:text-neutral-400 transition-colors"
            >
              Sign out
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}
