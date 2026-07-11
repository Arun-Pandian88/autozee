"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ToggleSuperAdmin({
  userId,
  email,
  isSuperAdmin,
}: {
  userId: string;
  email: string;
  isSuperAdmin: boolean;
}) {
  const [enabled, setEnabled] = useState(isSuperAdmin);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleToggle = async () => {
    if (email === "zeenoxofficial@gmail.com" && enabled) {
      alert("Cannot revoke super admin from the founder account.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/super-admin", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, isSuperAdmin: !enabled }),
      });
      if (res.ok) {
        setEnabled(!enabled);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      title={enabled ? "Revoke super admin" : "Grant super admin"}
      className="relative inline-flex h-5 w-9 items-center rounded-full transition-all disabled:opacity-50"
      style={{
        background: enabled ? "rgba(124,58,237,0.7)" : "rgba(255,255,255,0.1)",
        border: enabled ? "1px solid rgba(124,58,237,0.5)" : "1px solid rgba(255,255,255,0.1)",
      }}
    >
      <span
        className="inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform"
        style={{ transform: enabled ? "translateX(18px)" : "translateX(2px)" }}
      />
    </button>
  );
}
