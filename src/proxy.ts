import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const pathname = request.nextUrl.pathname

  // We use completely separate cookies for the Admin and Customer portals.
  // This guarantees physical isolation of the sessions.
  const isAdminArea = pathname.startsWith('/admin') || pathname.startsWith('/api/admin')
  const cookieName = isAdminArea ? 'sb-admin-auth-token' : undefined

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      ...(cookieName ? { cookieOptions: { name: cookieName } } : {}),
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const withRefreshedCookies = <T extends NextResponse>(response: T): T => {
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      response.cookies.set(cookie)
    })
    return response
  }

  const isAdminLoginPage = pathname === '/admin/login'

  // ----------------------------------------------------------------
  // Admin Portal Routing
  // ----------------------------------------------------------------
  if (isAdminArea) {
    if (!isAdminLoginPage) {
      if (!user) {
        // Unauthenticated visitor trying to access a protected admin page
        const url = request.nextUrl.clone()
        url.pathname = '/admin/login'
        url.search = ''
        return withRefreshedCookies(NextResponse.redirect(url))
      }

      // Defense in depth: Verify super admin status
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_super_admin')
        .eq('user_id', user.id)
        .maybeSingle()

      if (!profile?.is_super_admin) {
        // Somehow got an admin token but lacks privilege
        const url = request.nextUrl.clone()
        url.pathname = '/admin/login'
        url.search = ''
        return withRefreshedCookies(NextResponse.redirect(url))
      }
    } else {
      // /admin/login
      if (user) {
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
        // If not super admin, we let them render the login page,
        // which will sign them out automatically.
      }
    }
    
    return supabaseResponse
  }

  // ----------------------------------------------------------------
  // Customer Portal Routing
  // ----------------------------------------------------------------

  if (user && (
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname === '/forgot-password'
  )) {
    const url = request.nextUrl.clone()
    const inviteToken = request.nextUrl.searchParams.get('invite')

    // If a super admin somehow has a customer token, kick them to admin portal
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_super_admin')
      .eq('user_id', user.id)
      .maybeSingle()

    if (profile?.is_super_admin) {
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

  const protectedPaths = ['/dashboard', '/inbox', '/contacts', '/pipelines', '/broadcasts', '/automations', '/settings']
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path))

  if (isProtectedPath) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return withRefreshedCookies(NextResponse.redirect(url))
    }

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
