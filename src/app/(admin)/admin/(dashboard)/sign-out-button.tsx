"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminSignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <button
      onClick={handleSignOut}
      className="text-xs font-medium transition-colors"
      style={{ color: "rgba(148,163,184,0.5)" }}
      onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(226,232,240,0.8)")}
      onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(148,163,184,0.5)")}
    >
      Sign out
    </button>
  );
}
