import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key',
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  let user: any = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data?.user || null;
  } catch (err) {
    // Ignore auth lookup errors and proceed unauthenticated
    user = null;
  }

  const roleCookie = request.cookies.get('circulon_role')?.value;
  const userCookie = request.cookies.get('circulon_user')?.value;

  // Check demo admin query param
  if (request.nextUrl.searchParams.get('demo') === 'true') {
    supabaseResponse.cookies.set('circulon_role', 'admin', { path: '/' });
    supabaseResponse.cookies.set('circulon_user', 'admin@circulon.ai', { path: '/' });
  }

  // If user is not authenticated via Supabase Auth token, but has an active role session cookie, restore user
  if (!user && roleCookie) {
    user = {
      id: 'session-user',
      email: userCookie || `${roleCookie}@circulon.com`,
      user_metadata: { role: roleCookie },
    };
  }

  // Define protected routes
  const pathname = request.nextUrl.pathname;

  const isProtectedRoute = pathname.startsWith('/dashboard') || 
                           pathname.startsWith('/buyers') || 
                           pathname.startsWith('/waste') || 
                           pathname.startsWith('/buyer') || 
                           pathname.startsWith('/admin') || 
                           pathname.startsWith('/driver') || 
                           pathname.startsWith('/matches') || 
                           pathname.startsWith('/messages') || 
                           pathname.startsWith('/passport') || 
                           pathname.startsWith('/settings');

  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  if (user && isProtectedRoute) {
    let userRole = roleCookie || user?.user_metadata?.role;

    if (!userRole && user.id !== 'session-user') {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('approval_status, role')
          .eq('id', user.id)
          .maybeSingle();

        if (profile?.role) {
          userRole = profile.role;
        }

        // Account approval gate
        if (profile && profile.approval_status === 'pending' && userRole !== 'admin') {
          const url = request.nextUrl.clone();
          url.pathname = '/login';
          url.searchParams.set('message', 'Your company registration is currently pending admin approval.');
          url.searchParams.set('type', 'pending');
          return NextResponse.redirect(url);
        }
      } catch {
        // Ignore if database query fails during transition
      }
    }

    if (!userRole) {
      userRole = user.email?.toLowerCase().includes('admin') ? 'admin' : 
                 user.email?.toLowerCase().includes('driver') ? 'driver' : 
                 user.email?.toLowerCase().includes('buyer') ? 'buyer' : 'seller';
    }

    // Helper to redirect to appropriate user dashboard
    const getRoleDashboard = (role: string) => {
      if (role === 'admin') return '/admin';
      if (role === 'buyer') return '/buyer';
      if (role === 'driver') return '/driver';
      return '/dashboard';
    };

    // 1. Admin portal route protection: strictly admin only
    if (pathname.startsWith('/admin') && userRole !== 'admin') {
      const url = request.nextUrl.clone();
      url.pathname = getRoleDashboard(userRole);
      return NextResponse.redirect(url);
    }

    // 2. Driver route protection: driver only (admin allowed)
    if (pathname.startsWith('/driver') && userRole !== 'driver' && userRole !== 'admin') {
      const url = request.nextUrl.clone();
      url.pathname = getRoleDashboard(userRole);
      return NextResponse.redirect(url);
    }

    // 3. Buyer route protection: buyers only (admin allowed)
    if (pathname.startsWith('/buyer') && userRole !== 'buyer' && userRole !== 'admin') {
      const url = request.nextUrl.clone();
      url.pathname = getRoleDashboard(userRole);
      return NextResponse.redirect(url);
    }

    // 4. Seller route protection: sellers only (admin allowed)
    const isSellerOnlyRoute = pathname.startsWith('/dashboard') || 
                              pathname.startsWith('/waste') || 
                              pathname.startsWith('/buyers') || 
                              pathname.startsWith('/matches');
    if (isSellerOnlyRoute && userRole !== 'seller' && userRole !== 'admin') {
      const url = request.nextUrl.clone();
      url.pathname = getRoleDashboard(userRole);
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
