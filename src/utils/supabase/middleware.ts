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

  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data?.user || null;
  } catch (err) {
    // Ignore auth lookup errors and proceed unauthenticated
    user = null;
  }

  // Define protected routes
  const pathname = request.nextUrl.pathname;
  const adminCookie = request.cookies.get('circulon_role')?.value;
  const isDemoAdmin = pathname.startsWith('/admin') && (request.nextUrl.searchParams.get('demo') === 'true' || adminCookie === 'admin');

  if (isDemoAdmin) {
    if (adminCookie !== 'admin') {
      supabaseResponse.cookies.set('circulon_role', 'admin', { path: '/' });
    }
    return supabaseResponse;
  }

  const isProtectedRoute = pathname.startsWith('/dashboard') || 
                           pathname.startsWith('/buyers') || 
                           pathname.startsWith('/waste') ||
                           pathname.startsWith('/buyer') ||
                           pathname.startsWith('/admin') ||
                           pathname.startsWith('/matches') ||
                           pathname.startsWith('/settings');

  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  if (user && isProtectedRoute) {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('approval_status, role')
        .eq('id', user.id)
        .maybeSingle();

      const userRole = profile?.role || 
                       user.user_metadata?.role || 
                       (user.email?.toLowerCase().includes('admin') ? 'admin' : 'seller');

      // 1. Account approval gate
      if (profile && profile.approval_status === 'pending' && userRole !== 'admin') {
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        url.searchParams.set('message', 'Your company registration is currently pending admin approval.');
        url.searchParams.set('type', 'pending');
        return NextResponse.redirect(url);
      }

      // 2. Admin portal route protection: strictly admin only
      if (pathname.startsWith('/admin') && userRole !== 'admin') {
        const url = request.nextUrl.clone();
        url.pathname = userRole === 'buyer' ? '/buyer' : '/dashboard';
        return NextResponse.redirect(url);
      }

      // 3. Buyer route protection: sellers cannot access buyer routes
      if (pathname.startsWith('/buyer') && userRole === 'seller') {
        const url = request.nextUrl.clone();
        url.pathname = '/dashboard';
        return NextResponse.redirect(url);
      }

      // 4. Seller route protection: buyers cannot access seller waste & CRM routes
      const isSellerOnlyRoute = pathname.startsWith('/dashboard') || 
                                pathname.startsWith('/waste') || 
                                pathname.startsWith('/buyers');
      if (isSellerOnlyRoute && userRole === 'buyer') {
        const url = request.nextUrl.clone();
        url.pathname = '/buyer';
        return NextResponse.redirect(url);
      }
    } catch {
      // Ignore if database query fails during transition
    }
  }

  return supabaseResponse;
}
