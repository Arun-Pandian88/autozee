"use client";

import { useRouter } from "next/navigation";

/**
 * Admin-portal sign-out button.
 *
 * Posts to /api/auth/admin-signout instead of calling supabase.auth.signOut()
 * directly. This is intentional:
 *
 *   1. The server-side handler clears the session cookie before issuing the
 *      redirect, so the browser never sees a stale session on /admin/login.
 *
 *   2. It redirects to /admin/login — never to the customer /login page —
 *      keeping the admin completely inside the admin portal.
 *
 *   3. Avoids using the shared Supabase browser client's signOut() which
 *      would fire the onAuthStateChange listener in any open customer tab
 *      and unexpectedly log them out too.
 */
export default function AdminSignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    // POST to the admin-specific sign-out handler. On success the server
    // issues a redirect to /admin/login; router.push is a fallback in
    // case fetch() is used directly (here we rely on the form/fetch redirect).
    await fetch("/api/auth/admin-signout", { method: "POST" });
    // After the server clears the cookie, navigate the client to /admin/login.
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
