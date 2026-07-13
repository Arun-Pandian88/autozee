import { redirect } from "next/navigation";
import { getAdminAccount } from "@/lib/auth/account";
import AdminSidebar from "./sidebar";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ctx = await getAdminAccount().catch(() => null);
  if (!ctx?.isSuperAdmin) redirect("/admin/login");

  return (
    <div className="flex h-screen overflow-hidden text-neutral-200" style={{ background: "#05070d" }}>
      {/* Background glow */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(circle at 15% 50%, rgba(124,58,237,0.05), transparent 30%), radial-gradient(circle at 85% 30%, rgba(79,70,229,0.05), transparent 30%)",
        }}
      />

      <AdminSidebar adminName={ctx.account.name} />

      {/* Main */}
      <div className="relative z-10 flex flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <header
          className="flex h-16 items-center justify-between px-8 shrink-0"
          style={{
            background: "rgba(5,7,13,0.8)",
            backdropFilter: "blur(20px)",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <span className="font-medium text-neutral-300">Autozee</span>
            <span className="text-neutral-700">/</span>
            <span>Super Admin</span>
          </div>
          <div className="flex items-center gap-2 rounded-full px-3 py-1.5" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="text-xs font-medium text-emerald-400">All Systems Operational</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          <div className="mx-auto max-w-6xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
