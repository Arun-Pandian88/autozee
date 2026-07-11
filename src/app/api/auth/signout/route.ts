import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Sign the current user out and redirect to /login.
 *
 * Both GET and POST are handled:
 *   - POST: submitted by <form action="/api/auth/signout" method="POST">
 *   - GET:  direct navigation or any redirect that ends up here
 *
 * We use the SSR client so the session cookies are cleared server-side
 * before the redirect is issued — the browser never sees a stale session.
 */
async function handleSignout(request: NextRequest) {
  const supabase = await createClient();
  await supabase.auth.signOut();

  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.search = "";
  return NextResponse.redirect(url);
}

export const GET = handleSignout;
export const POST = handleSignout;
