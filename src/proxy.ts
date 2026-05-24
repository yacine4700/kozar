import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return supabaseResponse;
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // IMPORTANT: Do not remove this call. 
  // It is essential for ensuring the user session stays active.
  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
    
    // If getUser silently fails due to a network error, it might return a null user but an error object
    if (!user) {
      const { data: sessionData } = await supabase.auth.getSession();
      user = sessionData.session?.user || null;
    }
  } catch (error) {
    console.error("Network error in middleware getUser():", error);
    // Fallback to getSession which relies on the local cookie and might skip network request
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      user = sessionData.session?.user || null;
    } catch (sessionError) {
      console.error("Network error in middleware getSession():", sessionError);
    }
  }

  const isAuthPage = request.nextUrl.pathname.startsWith('/login');
  const isDebugPage = request.nextUrl.pathname.startsWith('/debug');
  const isProtectedPage = 
    request.nextUrl.pathname.startsWith('/dashboard') ||
    request.nextUrl.pathname.startsWith('/customers') ||
    request.nextUrl.pathname.startsWith('/products') ||
    request.nextUrl.pathname.startsWith('/orders');

  if (isDebugPage) {
    return supabaseResponse;
  }

  if (isProtectedPage && !user) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthPage && user) {
    const dashboardUrl = new URL('/dashboard', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
