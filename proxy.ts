import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { isAdminEmail } from '@/lib/auth-guard';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://aarojhgdvzeorhimszpk.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhcm9qaGdkdnplb3JoaW1zenBrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyNDQ0ODIsImV4cCI6MjA5NTgyMDQ4Mn0.bI58QLfKC7FtwoW7Cnml4RNnww8rU29bNQ-1YjjH54k';

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const pathname = request.nextUrl.pathname;

  try {
    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value),
            );
            supabaseResponse = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options),
            );
          },
        },
      },
    );

    const { data: { user } } = await supabase.auth.getUser();
    const isAuthorized = Boolean(user && isAdminEmail(user.email));

    // 1. Route Protection for /admin UI pages
    if (pathname.startsWith('/admin')) {
      if (!isAuthorized) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname + request.nextUrl.search);
        return NextResponse.redirect(loginUrl);
      }
    }

    // 2. Route Protection for /api/admin/* and /api/jarvis/*
    if (pathname.startsWith('/api/admin') || pathname.startsWith('/api/jarvis')) {
      const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
      const hasBearer = Boolean(authHeader && authHeader.toLowerCase().startsWith('bearer '));
      
      // If not authorized via cookie session and no Bearer token provided, block immediately with 401
      if (!isAuthorized && !hasBearer) {
        return NextResponse.json(
          { error: 'Unauthorized: Admin privileges required' },
          { status: 401 }
        );
      }
    }
  } catch (e) {
    if (pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return supabaseResponse;
}

export async function middleware(request: NextRequest) {
  return proxy(request);
}

export default proxy;

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4|webm)$).*)',
  ],
};
