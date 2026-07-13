import { createAdminClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Sign the current super-admin user out and redirect to /admin/login.
 *
 * This is the ADMIN-PORTAL-SPECIFIC counterpart of /api/auth/signout
 * (which is customer-portal-only and redirects to /login).
 *
 * Keeping two separate endpoints is intentional:
 *   • Customer sign-out  → /api/auth/signout       → /login
 *   • Admin sign-out     → /api/auth/admin-signout  → /admin/login
 *
 * This guarantees that an admin who clicks "Sign out" always lands
 * back on the admin login page, not the customer portal.
 *
 * Both GET and POST are handled for symmetry with the customer route.
 */
async function handleAdminSignout(request: NextRequest) {
  const supabase = await createAdminClient();
  await supabase.auth.signOut();

  const url = request.nextUrl.clone();
  url.pathname = "/admin/login";
  url.search = "";
  return NextResponse.redirect(url);
}

export const GET = handleAdminSignout;
export const POST = handleAdminSignout;
