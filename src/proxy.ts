import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
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

  const { pathname } = request.nextUrl

  // Redirect unauthenticated users to login
  if (!user && pathname !== '/' && !pathname.startsWith('/login') && !pathname.startsWith('/organizations') && !pathname.startsWith('/events')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (user) {
    const role = user.user_metadata?.role as string | undefined

    // Redirect authenticated users away from login
    if (pathname === '/login') {
      if (role === 'ADMIN') return NextResponse.redirect(new URL('/admin', request.url))
      if (role === 'ORGANIZER') return NextResponse.redirect(new URL('/organizer', request.url))
      return NextResponse.redirect(new URL('/student', request.url))
    }

    // Guard role-based routes
    if (pathname.startsWith('/admin') && role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/student', request.url))
    }
    if (pathname.startsWith('/organizer') && role !== 'ORGANIZER' && role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/student', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
