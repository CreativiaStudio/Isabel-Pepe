// =========================================================================
// ISABEL PEPE LUXURY E-COMMERCE - SERVER ANALYTICS AGGREGATION UTILITIES
// File: lib/analytics-query.ts
// =========================================================================

import { supabaseAdmin } from '@/lib/supabase';
import { DateRangeKey } from '@/types/analytics';

export interface DateRangeBounds {
  rangeKey: DateRangeKey;
  startDate: Date;
  endDate: Date;
  prevStartDate: Date;
  prevEndDate: Date;
  isHourly: boolean;
  timeSlots: Array<{
    timestamp: string;
    label: string;
    start: Date;
    end: Date;
  }>;
}

/**
 * Get current time in Europe/Rome timezone offset.
 */
export function getRomeTimeParts(d: Date = new Date()): {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
} {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Rome',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  });

  const parts = formatter.formatToParts(d);
  const getPart = (type: string) => {
    const val = parts.find((p) => p.type === type)?.value;
    return val ? parseInt(val, 10) : 0;
  };

  return {
    year: getPart('year'),
    month: getPart('month') - 1, // 0-indexed
    day: getPart('day'),
    hour: getPart('hour') === 24 ? 0 : getPart('hour'),
    minute: getPart('minute'),
  };
}

/**
 * Format a Date to Italian date label (e.g. "19 Ago", "08:00")
 */
export function formatRomeLabel(d: Date, mode: 'hour' | 'day' | 'full' = 'day'): string {
  if (mode === 'hour') {
    return new Intl.DateTimeFormat('it-IT', {
      timeZone: 'Europe/Rome',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(d);
  }

  if (mode === 'full') {
    return new Intl.DateTimeFormat('it-IT', {
      timeZone: 'Europe/Rome',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(d);
  }

  return new Intl.DateTimeFormat('it-IT', {
    timeZone: 'Europe/Rome',
    day: '2-digit',
    month: 'short',
  }).format(d);
}

/**
 * Parses user range string into robust start, end, previous start, previous end bounds,
 * with hourly/daily bucketing in Europe/Rome local time.
 */
export function parseDateRange(
  rangeParam?: string | null,
  fromParam?: string | null,
  toParam?: string | null
): DateRangeBounds {
  const now = new Date();
  const range = (rangeParam || 'today').toLowerCase() as DateRangeKey;

  let startDate: Date;
  let endDate: Date = now;
  let prevStartDate: Date;
  let prevEndDate: Date;
  let isHourly = false;

  if (range === 'today') {
    isHourly = true;
    // Start of today in Rome
    const rome = getRomeTimeParts(now);
    const startOfTodayMs = Date.UTC(rome.year, rome.month, rome.day, 0, 0, 0) - 2 * 3600 * 1000; // Approx UTC offset for Rome (CEST +2)
    startDate = new Date(startOfTodayMs);
    endDate = new Date(startOfTodayMs + 24 * 3600 * 1000 - 1);

    // Prev period: Yesterday
    prevStartDate = new Date(startDate.getTime() - 24 * 3600 * 1000);
    prevEndDate = new Date(endDate.getTime() - 24 * 3600 * 1000);
  } else if (range === '7d') {
    isHourly = false;
    startDate = new Date(now.getTime() - 7 * 24 * 3600 * 1000);
    prevStartDate = new Date(startDate.getTime() - 7 * 24 * 3600 * 1000);
    prevEndDate = new Date(startDate.getTime() - 1);
  } else if (range === '30d') {
    isHourly = false;
    startDate = new Date(now.getTime() - 30 * 24 * 3600 * 1000);
    prevStartDate = new Date(startDate.getTime() - 30 * 24 * 3600 * 1000);
    prevEndDate = new Date(startDate.getTime() - 1);
  } else if (range === 'month') {
    isHourly = false;
    const rome = getRomeTimeParts(now);
    const startOfMonthMs = Date.UTC(rome.year, rome.month, 1, 0, 0, 0) - 2 * 3600 * 1000;
    startDate = new Date(startOfMonthMs);

    const prevMonthYear = rome.month === 0 ? rome.year - 1 : rome.year;
    const prevMonthIndex = rome.month === 0 ? 11 : rome.month - 1;
    const startOfPrevMonthMs = Date.UTC(prevMonthYear, prevMonthIndex, 1, 0, 0, 0) - 2 * 3600 * 1000;
    prevStartDate = new Date(startOfPrevMonthMs);
    prevEndDate = new Date(startOfPrevMonthMs + (startDate.getTime() - startOfMonthMs));
  } else if (range === 'all') {
    isHourly = false;
    startDate = new Date('2024-01-01T00:00:00.000Z');
    prevStartDate = new Date('2023-01-01T00:00:00.000Z');
    prevEndDate = new Date('2023-12-31T23:59:59.999Z');
  } else if (range === 'custom' || fromParam) {
    startDate = fromParam ? new Date(fromParam) : new Date(now.getTime() - 7 * 24 * 3600 * 1000);
    endDate = toParam ? new Date(toParam) : now;
    if (isNaN(startDate.getTime())) startDate = new Date(now.getTime() - 7 * 24 * 3600 * 1000);
    if (isNaN(endDate.getTime())) endDate = now;

    const duration = endDate.getTime() - startDate.getTime();
    isHourly = duration <= 24 * 3600 * 1000;
    prevStartDate = new Date(startDate.getTime() - duration);
    prevEndDate = new Date(startDate.getTime() - 1);
  } else {
    // Default 7d
    isHourly = false;
    startDate = new Date(now.getTime() - 7 * 24 * 3600 * 1000);
    prevStartDate = new Date(startDate.getTime() - 7 * 24 * 3600 * 1000);
    prevEndDate = new Date(startDate.getTime() - 1);
  }

  // Generate slots
  const timeSlots: Array<{ timestamp: string; label: string; start: Date; end: Date }> = [];

  if (isHourly) {
    // 24 hourly buckets
    const startOfBase = new Date(startDate);
    startOfBase.setMinutes(0, 0, 0);

    for (let h = 0; h < 24; h++) {
      const slotStart = new Date(startDate.getTime() + h * 3600 * 1000);
      const slotEnd = new Date(slotStart.getTime() + 3600 * 1000 - 1);
      const label = `${String(h).padStart(2, '0')}:00`;
      timeSlots.push({
        timestamp: slotStart.toISOString(),
        label,
        start: slotStart,
        end: slotEnd,
      });
    }
  } else {
    // Daily buckets
    const diffDays = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (24 * 3600 * 1000)));
    for (let d = 0; d < diffDays; d++) {
      const slotStart = new Date(startDate.getTime() + d * 24 * 3600 * 1000);
      const slotEnd = new Date(slotStart.getTime() + 24 * 3600 * 1000 - 1);
      const label = formatRomeLabel(slotStart, 'day');
      timeSlots.push({
        timestamp: slotStart.toISOString(),
        label,
        start: slotStart,
        end: slotEnd,
      });
    }
  }

  return {
    rangeKey: range,
    startDate,
    endDate,
    prevStartDate,
    prevEndDate,
    isHourly,
    timeSlots,
  };
}

/**
 * Compute percentage delta with 1 decimal precision
 */
export function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }
  const delta = ((current - previous) / previous) * 100;
  return Math.round(delta * 10) / 10;
}

/**
 * Fetch visitor identities mapped by visitor_id for quick lookup
 */
export async function getVisitorIdentitiesMap(): Promise<Map<string, {
  name: string;
  email: string | null;
  role: string | null;
  phone: string | null;
  notes: string | null;
}>> {
  const map = new Map<string, any>();
  try {
    const { data } = await supabaseAdmin
      .from('visitor_identities')
      .select('visitor_id, name, email, role, phone, notes');
    if (data) {
      for (const row of data) {
        map.set(row.visitor_id, {
          name: row.name,
          email: row.email,
          role: row.role,
          phone: row.phone,
          notes: row.notes,
        });
      }
    }
  } catch (err) {
    console.error('Error fetching visitor identities:', err);
  }
  return map;
}

/**
 * Determine page classification category
 */
export function classifyPageType(path: string): 'product' | 'editorial' | 'catalog' | 'checkout' | 'home' | 'other' {
  if (path === '/' || path === '') return 'home';
  if (path.startsWith('/prodotto/')) return 'product';
  if (path.startsWith('/shop') || path.startsWith('/categoria') || path.startsWith('/collezione')) return 'catalog';
  if (path.startsWith('/checkout') || path.startsWith('/carrello') || path.startsWith('/cart')) return 'checkout';
  if (
    path.startsWith('/chi-siamo') ||
    path.startsWith('/storia') ||
    path.startsWith('/cura-gioielli') ||
    path.startsWith('/impegno-animali') ||
    path.startsWith('/guida-taglie') ||
    path.startsWith('/assistenza') ||
    path.startsWith('/blog')
  ) {
    return 'editorial';
  }
  return 'other';
}

/**
 * Generate human title from path
 */
export function getPageTitleFromPath(path: string): string {
  if (path === '/' || path === '') return 'Home Page — Isabel Pepe';
  if (path === '/shop') return 'Catalogo Gioielli';
  if (path === '/chi-siamo') return 'Chi Siamo — Storia del Brand';
  if (path === '/cura-gioielli') return 'Cura e Manutenzione Gioielli';
  if (path === '/impegno-animali') return 'Impegno per gli Animali';
  if (path === '/guida-taglie') return 'Guida alle Taglie';
  if (path === '/assistenza-clienti') return 'Assistenza Clienti';
  if (path === '/spedizioni-resi') return 'Spedizioni e Resi';
  if (path === '/privacy') return 'Informativa Privacy';
  if (path === '/cookie-policy') return 'Cookie Policy';
  if (path === '/termini-condizioni') return 'Termini e Condizioni';
  if (path === '/checkout') return 'Cassa e Pagamento';
  if (path.startsWith('/prodotto/')) {
    const slug = path.replace('/prodotto/', '').split('?')[0];
    return (
      slug
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ') + ' — Scheda Gioiello'
    );
  }
  return path;
}
