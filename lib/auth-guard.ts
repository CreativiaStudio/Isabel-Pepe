import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/server';
import { supabaseAdmin } from '@/lib/supabase';

export const ADMIN_EMAILS: readonly string[] = [
  'sviluppo@creativiastudio.com',
  'info@isabelpepe.com',
  'mario@isabelpepe.com',
  'mariopepe9@hotmail.it',
] as const;

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return ADMIN_EMAILS.some((admin) => admin.toLowerCase() === normalized);
}

export type AdminAuthSuccess = {
  authorized: true;
  user: User;
  response?: never;
};

export type AdminAuthFailure = {
  authorized: false;
  user: null;
  response: NextResponse;
};

export type AdminAuthResult = AdminAuthSuccess | AdminAuthFailure;

/**
 * Verifies that the incoming request has a valid Supabase session
 * belonging to an authorized administrator email.
 * 
 * Supports both:
 * 1. Bearer Token via `Authorization: Bearer <token>`
 * 2. Supabase SSR Session Cookies via `@/utils/supabase/server`
 */
export async function verifyAdminAuth(req?: Request | NextRequest): Promise<AdminAuthResult> {
  try {
    // 1. Check Bearer Token in Authorization header if present
    if (req) {
      const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
      if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
        const token = authHeader.substring(7).trim();
        if (token) {
          const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
          if (!error && user && isAdminEmail(user.email)) {
            return { authorized: true, user };
          }
        }
      }
    }

    // 2. Check Supabase SSR session cookie
    try {
      const supabase = await createClient();
      const { data: { user }, error } = await supabase.auth.getUser();

      if (!error && user && isAdminEmail(user.email)) {
        return { authorized: true, user };
      }
    } catch {
      // Ignore cookie store errors outside Next.js request scope (e.g. standalone test scripts)
    }

    return {
      authorized: false,
      user: null,
      response: NextResponse.json(
        { error: 'Unauthorized: Admin privileges required' },
        { status: 401 }
      ),
    };
  } catch (err: any) {
    console.error('verifyAdminAuth error:', err);
    return {
      authorized: false,
      user: null,
      response: NextResponse.json(
        { error: 'Unauthorized: Authentication check failed' },
        { status: 401 }
      ),
    };
  }
}
