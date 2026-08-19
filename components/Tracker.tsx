'use client';

// =========================================================================
// ISABEL PEPE LUXURY E-COMMERCE - FIRST-PARTY CLIENT TRACKER
// File: components/Tracker.tsx
// =========================================================================

import { useEffect, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  getOrCreateVisitorId,
  getOrCreateSessionId,
  updateSessionActivity,
  storeSessionAttribution,
  getSessionAttribution,
  getDeviceType,
  STORAGE_KEYS,
} from '@/lib/session';
import { detectClientAutomation } from '@/lib/bot-filter';
import { classifyAttribution, isInternalDomain, extractReferrerHost } from '@/lib/attribution';
import { ClientTelemetry, TrackPayload } from '@/types/analytics';

/**
 * Extracts normalized client browser and OS name from User-Agent
 */
function getClientBrowserAndOs(): { browser: string; os: string } {
  if (typeof navigator === 'undefined') {
    return { browser: 'Unknown', os: 'Unknown' };
  }

  const ua = navigator.userAgent || '';
  let browser = 'Other';
  let os = 'Other';

  // Detect OS
  if (/Windows NT 10.0/i.test(ua)) os = 'Windows 10/11';
  else if (/Windows NT 6.3/i.test(ua)) os = 'Windows 8.1';
  else if (/Windows NT 6.1/i.test(ua)) os = 'Windows 7';
  else if (/Windows NT/i.test(ua)) os = 'Windows';
  else if (/iPhone/i.test(ua)) os = 'iOS (iPhone)';
  else if (/iPad/i.test(ua)) os = 'iOS (iPad)';
  else if (/Macintosh|Mac OS X/i.test(ua)) os = 'macOS';
  else if (/Android/i.test(ua)) os = 'Android';
  else if (/Linux/i.test(ua)) os = 'Linux';
  else if (/CrOS/i.test(ua)) os = 'ChromeOS';

  // Detect Browser
  if (/Edg\//i.test(ua)) browser = 'Edge';
  else if (/Chrome\//i.test(ua) && !/Chromium|Edg\//i.test(ua)) browser = 'Chrome';
  else if (/Safari\//i.test(ua) && !/Chrome|Chromium|Edg\//i.test(ua)) browser = 'Safari';
  else if (/Firefox\//i.test(ua)) browser = 'Firefox';
  else if (/Opera|OPR\//i.test(ua)) browser = 'Opera';
  else if (/Trident|MSIE/i.test(ua)) browser = 'Internet Explorer';

  return { browser, os };
}

/**
 * Collects complete client telemetry snapshot
 */
function gatherClientTelemetry(): ClientTelemetry {
  if (typeof window === 'undefined') {
    return { device_type: 'desktop' };
  }

  const { browser, os } = getClientBrowserAndOs();
  const screenWidth = window.screen?.width || window.innerWidth || 0;
  const screenHeight = window.screen?.height || window.innerHeight || 0;

  let timezone = 'Europe/Rome';
  try {
    timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Rome';
  } catch {
    // ignore
  }

  const isWebdriver = detectClientAutomation() || Boolean(navigator.webdriver);

  return {
    screen_resolution: `${screenWidth}x${screenHeight}`,
    viewport_width: window.innerWidth || 0,
    viewport_height: window.innerHeight || 0,
    pixel_ratio: window.devicePixelRatio || 1,
    device_type: getDeviceType(navigator.userAgent, window.innerWidth),
    browser,
    os,
    language: navigator.language || 'it-IT',
    timezone,
    is_webdriver: isWebdriver,
  };
}

export default function Tracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [visitorId, setVisitorId] = useState<string>('');
  const [sessionId, setSessionId] = useState<string>('');
  const [consentId, setConsentId] = useState<string | null>(null);

  // References to preserve state across route changes and beforeunload
  const currentPathRef = useRef<string>('');
  const pageStartTimeRef = useRef<number>(Date.now());
  const initialReferrerRef = useRef<string>('');
  const visitorIdRef = useRef<string>('');
  const sessionIdRef = useRef<string>('');
  const consentIdRef = useRef<string | null>(null);

  // 1. Initial Setup on Mount: IDs, Initial Referrer, Consent Listener
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Capture initial document.referrer on site landing
    const rawReferrer = document.referrer || '';
    initialReferrerRef.current = rawReferrer;

    // Manage IDs
    const vid = getOrCreateVisitorId();
    const { sessionId: sid } = getOrCreateSessionId();
    setVisitorId(vid);
    setSessionId(sid);
    visitorIdRef.current = vid;
    sessionIdRef.current = sid;

    // Retrieve consent ID from localStorage
    const savedConsentId = localStorage.getItem(STORAGE_KEYS.CONSENT_ID);
    if (savedConsentId) {
      setConsentId(savedConsentId);
      consentIdRef.current = savedConsentId;
    }

    // Process initial landing attribution
    const searchObj: Record<string, string> = {};
    if (searchParams) {
      searchParams.forEach((value, key) => {
        searchObj[key] = value;
      });
    }

    const cachedAttribution = getSessionAttribution();
    const refHost = extractReferrerHost(rawReferrer);
    const hasExternalReferrer = Boolean(rawReferrer && !isInternalDomain(refHost));
    const hasUtms = Object.keys(searchObj).some((k) =>
      ['utm_source', 'utm_medium', 'utm_campaign', 'gclid', 'fbclid', 'ttclid'].includes(k.toLowerCase())
    );

    // If there is new campaign or external referrer, or no cached attribution, classify and store
    if (!cachedAttribution || hasExternalReferrer || hasUtms) {
      const attribution = classifyAttribution(rawReferrer, searchObj);
      storeSessionAttribution(attribution);
    }

    // Listen to custom cookie consent updates
    const handleConsentEvent = (e: CustomEvent<{ consentId?: string }>) => {
      if (e.detail?.consentId) {
        const newConsentId = e.detail.consentId;
        setConsentId(newConsentId);
        consentIdRef.current = newConsentId;
      }
    };

    window.addEventListener('isabel_cookie_consent', handleConsentEvent as EventListener);

    return () => {
      window.removeEventListener('isabel_cookie_consent', handleConsentEvent as EventListener);
    };
  }, []);

  // 2. Beacon / Page Exit handler (computes duration and sends keepalive exit payload)
  const sendExitBeacon = () => {
    if (typeof window === 'undefined') return;
    const path = currentPathRef.current;
    const vid = visitorIdRef.current || localStorage.getItem(STORAGE_KEYS.VISITOR_ID);
    const sid = sessionIdRef.current || sessionStorage.getItem(STORAGE_KEYS.SESSION_ID) || localStorage.getItem(STORAGE_KEYS.SESSION_ID);
    const cid = consentIdRef.current || localStorage.getItem(STORAGE_KEYS.CONSENT_ID);

    if (!path || !vid || !sid) return;

    const durationSeconds = Math.max(0, Math.floor((Date.now() - pageStartTimeRef.current) / 1000));

    const exitPayload: TrackPayload = {
      path,
      visitorId: vid,
      sessionId: sid,
      consentId: cid,
      durationSeconds,
      isExit: true,
      telemetry: gatherClientTelemetry(),
    };

    const payloadJson = JSON.stringify(exitPayload);

    // Prioritize navigator.sendBeacon for reliable delivery during page unload
    if (navigator.sendBeacon) {
      const blob = new Blob([payloadJson], { type: 'application/json' });
      navigator.sendBeacon('/api/track', blob);
    } else {
      fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payloadJson,
        keepalive: true,
      }).catch(() => {});
    }
  };

  // 3. Register lifecycle exit listeners (beforeunload & visibilitychange)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleBeforeUnload = () => {
      sendExitBeacon();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        sendExitBeacon();
      } else if (document.visibilityState === 'visible') {
        // Reset page start time when coming back into focus
        pageStartTimeRef.current = Date.now();
        updateSessionActivity();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // 4. Send Page View on Route Change
  useEffect(() => {
    if (typeof window === 'undefined' || !pathname) return;

    // Send previous page exit duration if transitioning within SPA
    if (currentPathRef.current && currentPathRef.current !== pathname) {
      sendExitBeacon();
    }

    // Reset page timer for the new view
    pageStartTimeRef.current = Date.now();

    // Ensure session IDs are fresh and active
    const vid = visitorId || getOrCreateVisitorId();
    const { sessionId: sid } = getOrCreateSessionId();

    setVisitorId(vid);
    setSessionId(sid);
    visitorIdRef.current = vid;
    sessionIdRef.current = sid;

    // Build full path including query parameters
    const queryString = searchParams?.toString() ? `?${searchParams.toString()}` : '';
    const fullPath = `${pathname}${queryString}`;
    currentPathRef.current = fullPath;

    // Extract search params object
    const searchParamsObj: Record<string, string> = {};
    if (searchParams) {
      searchParams.forEach((val, key) => {
        searchParamsObj[key] = val;
      });
    }

    // Active referrer (uses document.referrer or cached initial referrer)
    const activeReferrer = document.referrer || initialReferrerRef.current || null;
    const activeConsentId = consentId || localStorage.getItem(STORAGE_KEYS.CONSENT_ID) || null;
    consentIdRef.current = activeConsentId;

    const telemetry = gatherClientTelemetry();

    // Construct full TrackPayload
    const payload: TrackPayload = {
      path: fullPath,
      visitorId: vid,
      sessionId: sid,
      consentId: activeConsentId,
      referrer: activeReferrer,
      searchParams: searchParamsObj,
      telemetry,
      durationSeconds: 0,
      isExit: false,
    };

    // Dispatch POST request to /api/track
    fetch('/api/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then(() => {
        updateSessionActivity();
      })
      .catch((err) => {
        // Fail silently in production, avoid disrupting user experience
        if (process.env.NODE_ENV === 'development') {
          console.warn('Analytics tracking warning:', err);
        }
      });
  }, [pathname, searchParams, visitorId, consentId]);

  return null; // Invisible analytics agent
}
