// =========================================================================
// ISABEL PEPE LUXURY E-COMMERCE - SESSION MANAGEMENT LIBRARY
// File: lib/session.ts
// =========================================================================

import { AttributionData, DeviceType } from '@/types/analytics';

/**
 * Standard Storage & Cookie Keys for First-Party Analytics
 */
export const STORAGE_KEYS = {
  VISITOR_ID: 'isabel_visitor_id',
  SESSION_ID: 'isabel_session_id',
  LAST_ACTIVE: 'isabel_session_last_active',
  SESSION_START: 'isabel_session_start',
  ATTRIBUTION: 'isabel_session_attribution',
  CONSENT_ID: 'isabel_consent_id',
  ADMIN_IGNORE: 'isabel_admin_ignore',
} as const;

export const COOKIE_KEYS = {
  VISITOR_COOKIE: 'is_vid',
  SESSION_COOKIE: 'is_sid',
} as const;

/**
 * 30-Minute Session Timeout in milliseconds
 */
export const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes = 1,800,000 ms

/**
 * Generates a high-entropy first-party Visitor ID
 */
export function generateVisitorId(): string {
  const rand = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
  const time = Date.now().toString(36);
  return `vid_${rand}_${time}`;
}

/**
 * Generates a unique Session ID
 */
export function generateSessionId(): string {
  const rand = Math.random().toString(36).substring(2, 10);
  const time = Date.now().toString(36);
  return `sid_${rand}_${time}`;
}

/**
 * Checks if a session has expired based on last active timestamp
 */
export function isSessionExpired(lastActive: number | string | Date | null | undefined): boolean {
  if (!lastActive) return true;

  const timestamp =
    typeof lastActive === 'number'
      ? lastActive
      : new Date(lastActive).getTime();

  if (isNaN(timestamp) || timestamp <= 0) return true;

  const elapsed = Date.now() - timestamp;
  return elapsed > SESSION_TIMEOUT_MS;
}

/**
 * Computes duration in seconds between start time and end/current time
 */
export function getSessionDuration(
  startedAt: number | string | Date,
  endedAt?: number | string | Date | null
): number {
  const start =
    typeof startedAt === 'number' ? startedAt : new Date(startedAt).getTime();
  const end = endedAt
    ? typeof endedAt === 'number'
      ? endedAt
      : new Date(endedAt).getTime()
    : Date.now();

  if (isNaN(start) || isNaN(end) || end < start) return 0;
  return Math.max(0, Math.floor((end - start) / 1000));
}

/**
 * Reads a cookie value by name in browser context
 */
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
}

/**
 * Sets a first-party cookie with secure attributes
 */
export function setCookie(name: string, value: string, maxAgeSeconds: number): void {
  if (typeof document === 'undefined') return;
  const isSecure = window.location.protocol === 'https:';
  const cookieString = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax${
    isSecure ? '; Secure' : ''
  }`;
  document.cookie = cookieString;
}

/**
 * Gets or creates persistent Visitor ID across localStorage and 1-year first-party cookie
 */
export function getOrCreateVisitorId(): string {
  if (typeof window === 'undefined') {
    return generateVisitorId();
  }

  try {
    let vid = localStorage.getItem(STORAGE_KEYS.VISITOR_ID);
    if (!vid) {
      vid = getCookie(COOKIE_KEYS.VISITOR_COOKIE);
    }

    if (!vid || !vid.startsWith('vid_')) {
      vid = generateVisitorId();
      localStorage.setItem(STORAGE_KEYS.VISITOR_ID, vid);
      setCookie(COOKIE_KEYS.VISITOR_COOKIE, vid, 365 * 24 * 60 * 60); // 1 year
    } else {
      // Sync cookie and storage
      localStorage.setItem(STORAGE_KEYS.VISITOR_ID, vid);
      setCookie(COOKIE_KEYS.VISITOR_COOKIE, vid, 365 * 24 * 60 * 60);
    }

    return vid;
  } catch {
    return generateVisitorId();
  }
}

/**
 * Manages 30-minute rolling session lifecycle in client context
 */
export function getOrCreateSessionId(options?: {
  forceNew?: boolean;
}): { sessionId: string; isNewSession: boolean } {
  if (typeof window === 'undefined') {
    return { sessionId: generateSessionId(), isNewSession: true };
  }

  try {
    const now = Date.now();
    const storedSid = sessionStorage.getItem(STORAGE_KEYS.SESSION_ID) || localStorage.getItem(STORAGE_KEYS.SESSION_ID);
    const lastActiveStr = localStorage.getItem(STORAGE_KEYS.LAST_ACTIVE);
    const lastActive = lastActiveStr ? parseInt(lastActiveStr, 10) : 0;

    const isExpired = isSessionExpired(lastActive);
    const shouldCreateNew = options?.forceNew || !storedSid || isExpired;

    if (shouldCreateNew) {
      const newSid = generateSessionId();
      sessionStorage.setItem(STORAGE_KEYS.SESSION_ID, newSid);
      localStorage.setItem(STORAGE_KEYS.SESSION_ID, newSid);
      localStorage.setItem(STORAGE_KEYS.LAST_ACTIVE, String(now));
      localStorage.setItem(STORAGE_KEYS.SESSION_START, String(now));
      setCookie(COOKIE_KEYS.SESSION_COOKIE, newSid, 1800); // 30 min cookie

      return { sessionId: newSid, isNewSession: true };
    }

    // Refresh last active timestamp
    localStorage.setItem(STORAGE_KEYS.LAST_ACTIVE, String(now));
    setCookie(COOKIE_KEYS.SESSION_COOKIE, storedSid, 1800);

    return { sessionId: storedSid, isNewSession: false };
  } catch {
    return { sessionId: generateSessionId(), isNewSession: true };
  }
}

/**
 * Heartbeat updater: updates session last active timestamp
 */
export function updateSessionActivity(): void {
  if (typeof window === 'undefined') return;
  try {
    const now = Date.now();
    localStorage.setItem(STORAGE_KEYS.LAST_ACTIVE, String(now));
  } catch {
    // ignore localstorage errors
  }
}

/**
 * Stores attribution data in sessionStorage for the duration of the visitor session
 */
export function storeSessionAttribution(attribution: AttributionData): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(STORAGE_KEYS.ATTRIBUTION, JSON.stringify(attribution));
  } catch {
    // ignore
  }
}

/**
 * Retrieves cached attribution data for current session
 */
export function getSessionAttribution(): AttributionData | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEYS.ATTRIBUTION);
    if (!raw) return null;
    return JSON.parse(raw) as AttributionData;
  } catch {
    return null;
  }
}

/**
 * Determines device type from User-Agent and viewport width
 */
export function getDeviceType(userAgent?: string | null, width?: number): DeviceType {
  const ua = (userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent : '')).toLowerCase();
  const screenWidth = width !== undefined ? width : typeof window !== 'undefined' ? window.innerWidth : 1200;

  if (/(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk)/i.test(ua)) {
    return 'tablet';
  }

  if (/(mobi|ipod|phone|blackberry|opera mini|fennec|minimo|symbian|psp|nintendo)/i.test(ua) || screenWidth < 768) {
    return 'mobile';
  }

  if (screenWidth >= 768 && screenWidth <= 1024) {
    return 'tablet';
  }

  return 'desktop';
}
