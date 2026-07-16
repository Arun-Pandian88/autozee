"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createAdminClient();

    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({ email, password });

    if (authError || !authData.user) {
      setError("Invalid credentials. Access denied.");
      setLoading(false);
      return;
    }

    // Check is_super_admin flag
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_super_admin")
      .eq("user_id", authData.user.id)
      .maybeSingle();

    if (!profile?.is_super_admin) {
      // Not a super admin — sign them out and deny
      await supabase.auth.signOut();
      setError("Access denied. Super admin privileges required.");
      setLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 relative overflow-hidden">
      {/* Background orbs */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-48 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 inset-x-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(124,58,237,0.4), transparent)",
        }}
      />

      {/* Grid lines */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 80% at 50% 50%, black, transparent)",
        }}
      />

      <div className="relative z-10 w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl shadow-[0_0_30px_rgba(16,185,129,0.4)] shrink-0"
            style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" fill="white"/>
              <path d="M12 0C5.374 0 0 5.373 0 12c0 2.116.554 4.103 1.523 5.83L.057 23.215a.75.75 0 00.92.908l5.42-1.458A11.945 11.945 0 0012 24c6.626 0 12-5.373 12-12S18.626 0 12 0z" fill="white" fillOpacity="0.3"/>
            </svg>
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold text-white tracking-tight">
              Autozee Admin
            </h1>
            <p className="text-sm text-neutral-500 mt-0.5">
              Restricted access — Super admins only
            </p>
          </div>
        </div>

        {/* Form card */}
        <div
          className="rounded-2xl p-8 space-y-6"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(12px)",
            boxShadow: "0 32px 80px rgba(0,0,0,0.5)",
          }}
        >
          <div>
            <h2 className="text-lg font-semibold text-white">
              Super Admin Sign in
            </h2>
            <p className="text-sm text-neutral-500 mt-1">
              Enter your admin credentials to access the platform.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="admin-email"
                className="text-xs font-medium text-neutral-400 uppercase tracking-wider"
              >
                Email
              </label>
              <input
                id="admin-email"
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@autozee.com"
                className="w-full rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-neutral-600 outline-none transition-all"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.border =
                    "1px solid rgba(124,58,237,0.5)";
                  e.currentTarget.style.boxShadow =
                    "0 0 0 3px rgba(124,58,237,0.1)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.border =
                    "1px solid rgba(255,255,255,0.1)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="admin-password"
                className="text-xs font-medium text-neutral-400 uppercase tracking-wider"
              >
                Password
              </label>
              <input
                id="admin-password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-neutral-600 outline-none transition-all"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.border =
                    "1px solid rgba(124,58,237,0.5)";
                  e.currentTarget.style.boxShadow =
                    "0 0 0 3px rgba(124,58,237,0.1)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.border =
                    "1px solid rgba(255,255,255,0.1)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>

            {error && (
              <div
                className="flex items-center gap-2.5 rounded-xl px-4 py-3"
                style={{
                  background: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.2)",
                }}
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-red-400 shrink-0"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl py-2.5 text-sm font-semibold text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                background: loading
                  ? "rgba(124,58,237,0.5)"
                  : "linear-gradient(135deg, #7c3aed, #4f46e5)",
                boxShadow: loading
                  ? "none"
                  : "0 4px 20px rgba(124,58,237,0.4)",
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Authenticating…
                </span>
              ) : (
                "Access Admin Panel"
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-neutral-600">
          Not an admin?{" "}
          <a
            href="/login"
            className="text-neutral-500 hover:text-neutral-300 transition-colors"
          >
            Sign in as customer →
          </a>
        </p>
      </div>
    </div>
  );
}
