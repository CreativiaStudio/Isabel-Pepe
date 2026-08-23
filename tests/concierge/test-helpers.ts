import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
process.env.ENABLE_TEST_AUTH_HEADER = 'true';
import { supabaseAdmin } from '../../lib/supabase';
import { isAdminEmail, ADMIN_EMAILS } from '../../lib/auth-guard';

export interface TestResult {
  suite: string;
  name: string;
  passed: boolean;
  durationMs: number;
  error?: string;
}

export class TestRunner {
  private results: TestResult[] = [];
  private suiteName: string;

  constructor(suiteName: string) {
    this.suiteName = suiteName;
  }

  async test(name: string, fn: () => Promise<void> | void): Promise<void> {
    const start = Date.now();
    try {
      await fn();
      const durationMs = Date.now() - start;
      this.results.push({
        suite: this.suiteName,
        name,
        passed: true,
        durationMs,
      });
      console.log(`  \x1b[32m✔\x1b[0m ${name} \x1b[90m(${durationMs}ms)\x1b[0m`);
    } catch (err: any) {
      const durationMs = Date.now() - start;
      const errorMsg = err?.message || String(err);
      this.results.push({
        suite: this.suiteName,
        name,
        passed: false,
        durationMs,
        error: errorMsg,
      });
      console.error(`  \x1b[31m✖\x1b[0m ${name} \x1b[90m(${durationMs}ms)\x1b[0m`);
      console.error(`    \x1b[31mError: ${errorMsg}\x1b[0m`);
    }
  }

  getResults(): TestResult[] {
    return this.results;
  }

  summary(): { total: number; passed: number; failed: number; totalDurationMs: number } {
    const total = this.results.length;
    const passed = this.results.filter((r) => r.passed).length;
    const failed = total - passed;
    const totalDurationMs = this.results.reduce((acc, r) => acc + r.durationMs, 0);
    return { total, passed, failed, totalDurationMs };
  }
}

// Assertions
export function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`Assertion Failed: ${message}`);
  }
}

export function assertEqual<T>(actual: T, expected: T, message?: string): void {
  if (actual !== expected) {
    throw new Error(
      `Assertion Failed: ${message || ''}\n  Expected: ${JSON.stringify(expected)}\n  Actual:   ${JSON.stringify(actual)}`
    );
  }
}

export function assertIncludes(actual: string, expectedSubstring: string, message?: string): void {
  if (!actual || !actual.includes(expectedSubstring)) {
    throw new Error(
      `Assertion Failed: ${message || ''}\n  Expected string to include: "${expectedSubstring}"\n  Actual string: "${actual}"`
    );
  }
}

export function assertDefined<T>(val: T | null | undefined, message?: string): asserts val is T {
  if (val === undefined || val === null) {
    throw new Error(`Assertion Failed: Expected value to be defined. ${message || ''}`);
  }
}

// Mock Request Factory for Next.js App Router route handlers
export function createMockRequest(
  url: string,
  options: {
    method?: string;
    body?: any;
    headers?: Record<string, string>;
    ip?: string;
  } = {}
): Request {
  const method = options.method || 'POST';
  const randomIp = `192.168.${Math.floor(Math.random() * 250) + 1}.${Math.floor(Math.random() * 250) + 1}`;
  const defaultIp = options.ip || options.headers?.['x-forwarded-for'] || randomIp;
  const headers = new Headers({
    'content-type': 'application/json',
    'x-forwarded-for': defaultIp,
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) IsabelPepeE2ETestRunner/1.0',
    ...(options.headers || {}),
  });

  const reqInit: RequestInit = {
    method,
    headers,
  };

  if (options.body !== undefined && method !== 'GET' && method !== 'HEAD') {
    reqInit.body = typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
  }

  return new Request(url, reqInit);
}

// Helper to generate unique test customer emails
export function generateTestEmail(prefix = 'e2e_concierge'): string {
  const timestamp = Date.now();
  const rand = Math.random().toString(36).substring(2, 7);
  return `${prefix}_${timestamp}_${rand}@isabelpepe-test.com`;
}

// Database cleanup helper for support messages
export async function cleanupTestData(options: {
  emails?: string[];
  messageIds?: string[];
}): Promise<void> {
  try {
    if (options.messageIds && options.messageIds.length > 0) {
      await supabaseAdmin
        .from('support_messages')
        .delete()
        .in('id', options.messageIds);
    }

    if (options.emails && options.emails.length > 0) {
      await supabaseAdmin
        .from('support_messages')
        .delete()
        .in('customer_email', options.emails);
    }
  } catch (err) {
    console.warn('⚠️ Cleanup warning (non-fatal):', err);
  }
}

// Dynamic Loaders for Next.js Route Handlers and Server Actions
export async function getContactRouteHandler(): Promise<(req: Request) => Promise<Response>> {
  try {
    const mod = await import('../../app/api/contact/route');
    return mod.POST;
  } catch (err: any) {
    throw new Error(`Contact route handler (app/api/contact/route.ts) could not be loaded: ${err.message}`);
  }
}

export async function getAdminReplyRouteHandler(): Promise<(req: Request) => Promise<Response>> {
  try {
    const mod = await import('../../app/api/admin/messages/reply/route');
    return mod.POST;
  } catch (err: any) {
    throw new Error(`Admin reply route handler (app/api/admin/messages/reply/route.ts) could not be loaded: ${err.message}`);
  }
}

export async function getAdminMessageActions(): Promise<{
  updateMessageStatus: (id: string, status: string) => Promise<{ success: boolean; error?: string }>;
  deleteMessage: (id: string) => Promise<{ success: boolean; error?: string }>;
}> {
  try {
    const mod = await import('../../app/admin/actions_messages');
    return {
      updateMessageStatus: mod.updateMessageStatus,
      deleteMessage: mod.deleteMessage,
    };
  } catch (err: any) {
    throw new Error(`Admin message actions (app/admin/actions_messages.ts) could not be loaded: ${err.message}`);
  }
}

export { isAdminEmail, ADMIN_EMAILS };
