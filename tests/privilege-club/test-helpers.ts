import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { supabaseAdmin } from '../../lib/supabase';

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

// Mock Request Factory for Next.js App Router route handlers
export function createMockRequest(
  url: string,
  options: {
    method?: string;
    body?: any;
    headers?: Record<string, string>;
  } = {}
): Request {
  const method = options.method || 'POST';
  const headers = new Headers({
    'content-type': 'application/json',
    'x-forwarded-for': '127.0.0.1',
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

// Helper to generate unique test emails
export function generateTestEmail(prefix = 'e2e_vip'): string {
  const timestamp = Date.now();
  const rand = Math.random().toString(36).substring(2, 7);
  return `${prefix}_${timestamp}_${rand}@isabelpepe-test.com`;
}

// Database cleanup helper
export async function cleanupTestData(emails: string[]): Promise<void> {
  if (!emails || emails.length === 0) return;
  try {
    // 1. Delete from newsletter_subscribers
    await supabaseAdmin
      .from('newsletter_subscribers')
      .delete()
      .in('email', emails);

    // 2. Delete from crm_contacts
    await supabaseAdmin
      .from('crm_contacts')
      .delete()
      .in('email', emails);

    // 3. Delete from customers (if test records were created)
    await supabaseAdmin
      .from('customers')
      .delete()
      .in('email', emails);
  } catch (err) {
    console.warn('⚠️ Cleanup warning (non-fatal):', err);
  }
}
