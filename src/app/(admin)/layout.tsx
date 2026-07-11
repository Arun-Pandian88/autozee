import { getCurrentAccount } from "@/lib/auth/account";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // The /admin/login page handles its own auth check.
  // All other admin pages need is_super_admin = true.
  // We detect the login page by checking if it can be rendered without a session.
  // So we allow the layout to render and let each page do its own guard.
  return (
    <div className="min-h-screen bg-[#080b14] text-neutral-100 antialiased selection:bg-violet-500/30">
      {children}
    </div>
  );
}
