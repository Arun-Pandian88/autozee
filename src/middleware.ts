import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // getUser() transparently refreshes an expired access token, which
  // ROTATES the refresh token and writes the new cookies onto
  // `supabaseResponse` via setAll() above. Any response we return in
  // place of `supabaseResponse` (every redirect / JSON branch below)
  // is a fresh object that does NOT carry those Set-Cookie headers, so
  // the rotated token never reaches the browser. The next request then
  // replays the old, now-consumed refresh token, the refresh fails, and
  // the session wedges — the user gets a broken reload after idling and
  // can only recover by manually clearing cookies (issue #288). Copy the
  // refreshed cookies onto whatever response we hand back to fix that.
  const withRefreshedCookies = <T extends NextResponse>(response: T): T => {
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      response.cookies.set(cookie)
    })
    return response
  }

  const pathname = request.nextUrl.pathname

  // ----------------------------------------------------------------
  // Role-based route isolation
  //
  // Two completely separate login portals:
  //   • /admin/login   → super admins only  → lands on /admin
  //   • /login         → customers & owners → lands on /dashboard
  //
  // Rules enforced here (in priority order):
  //
  // 1. Unauthenticated visitors to any /admin/* page (except
  //    /admin/login itself) → redirect to /admin/login
  //
  // 2. Authenticated super admin on /admin/login (already signed in)
  //    → redirect to /admin (no need to log in again)
  //
  // 3. Authenticated NON-super-admin on /admin/login
  //    → redirect to /login (wrong door; the page itself also signs
  //    them out if they somehow arrive authenticated)
  //
  // 4. Authenticated NON-super-admin trying to access /admin/*
  //    → redirect to /login (access denied)
  //
  // 5. Authenticated super admin trying to use /login, /signup, etc.
  //    → redirect to /admin (they belong in the admin portal)
  // ----------------------------------------------------------------

  const isAdminLoginPage = pathname === '/admin/login'
  const isAdminArea = pathname.startsWith('/admin')

  if (isAdminArea) {
    if (!isAdminLoginPage) {
      // Rule 1 — unauthenticated user trying to access a protected admin page
      if (!user) {
        const url = request.nextUrl.clone()
        url.pathname = '/admin/login'
        url.search = ''
        return withRefreshedCookies(NextResponse.redirect(url))
      }

      // Rules 3 & 4 — authenticated but may lack super admin privilege
      // We fetch the profile to check is_super_admin. This is a single
      // lightweight query on a primary-key column and only runs for
      // /admin/* requests, so the overhead is acceptable.
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_super_admin')
        .eq('user_id', user.id)
        .maybeSingle()

      if (!profile?.is_super_admin) {
        // Not a super admin — send them to the regular login page
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        url.search = ''
        return withRefreshedCookies(NextResponse.redirect(url))
      }
    } else {
      // /admin/login — handle already-authenticated visitors
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_super_admin')
          .eq('user_id', user.id)
          .maybeSingle()

        if (profile?.is_super_admin) {
          // Rule 2 — super admin already signed in, skip login page
          const url = request.nextUrl.clone()
          url.pathname = '/admin'
          url.search = ''
          return withRefreshedCookies(NextResponse.redirect(url))
        }

        // Rule 3 — non-admin landed on /admin/login while authenticated
        // Redirect to /login; the regular login page will handle them.
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        url.search = ''
        return withRefreshedCookies(NextResponse.redirect(url))
      }
    }
  }

  // ----------------------------------------------------------------
  // Regular auth pages — redirect to dashboard if already signed in.
  // Exception: when an invite token is in the query string we
  // send the already-signed-in user to /join/<token> instead so
  // they can accept the invitation in one click. Without this,
  // a forwarded invite link to someone who's already signed in
  // would silently drop them on /dashboard.
  //
  // Rule 5 — if the user is a super admin, send them to /admin instead.
  // ----------------------------------------------------------------
  if (user && (
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname === '/forgot-password'
  )) {
    const url = request.nextUrl.clone()
    const inviteToken = request.nextUrl.searchParams.get('invite')

    // Check if super admin — they should not be using the regular portal
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_super_admin')
      .eq('user_id', user.id)
      .maybeSingle()

    if (profile?.is_super_admin) {
      // Rule 5 — super admin visiting the regular auth pages → /admin
      url.pathname = '/admin'
      url.search = ''
      return withRefreshedCookies(NextResponse.redirect(url))
    }

    if (
      inviteToken &&
      (pathname === '/login' || pathname === '/signup')
    ) {
      url.pathname = `/join/${encodeURIComponent(inviteToken)}`
      url.search = ''
    } else {
      url.pathname = '/dashboard'
      url.search = ''
    }
    return withRefreshedCookies(NextResponse.redirect(url))
  }

  // Protected pages - customer area
  const protectedPaths = ['/dashboard', '/inbox', '/contacts', '/pipelines', '/broadcasts', '/automations', '/settings']
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path))

  if (isProtectedPath) {
    if (!user) {
      // Unauthenticated → redirect to /login
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return withRefreshedCookies(NextResponse.redirect(url))
    }

    // Authenticated, check if super admin — they belong in the admin portal, not here.
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_super_admin')
      .eq('user_id', user.id)
      .maybeSingle()

    if (profile?.is_super_admin) {
      const url = request.nextUrl.clone()
      url.pathname = '/admin'
      url.search = ''
      return withRefreshedCookies(NextResponse.redirect(url))
    }
  }

  // API routes that need auth (not webhooks)
  if (!user && pathname.startsWith('/api/whatsapp/') &&
      !pathname.includes('/webhook')) {
    return withRefreshedCookies(
      NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    )
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
