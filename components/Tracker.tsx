'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export function generateVisitorId() {
  return 'vid_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

export default function Tracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [visitorId, setVisitorId] = useState<string | null>(null);
  const [consentId, setConsentId] = useState<string | null>(null);

  useEffect(() => {
    // Generate or retrieve visitor ID from localStorage
    let currentVisitorId = localStorage.getItem('isabel_visitor_id');
    if (!currentVisitorId) {
      currentVisitorId = generateVisitorId();
      localStorage.setItem('isabel_visitor_id', currentVisitorId);
    }
    setVisitorId(currentVisitorId);

    const currentConsentId = localStorage.getItem('isabel_consent_id');
    if (currentConsentId) {
      setConsentId(currentConsentId);
    }

    const handleConsent = (e: any) => {
      if (e.detail?.consentId) {
        setConsentId(e.detail.consentId);
      }
    };
    window.addEventListener('isabel_cookie_consent', handleConsent);
    return () => window.removeEventListener('isabel_cookie_consent', handleConsent);
  }, []);

  useEffect(() => {
    if (!visitorId || !pathname) return;

    // Build the full path
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');

    const activeConsentId = consentId || localStorage.getItem('isabel_consent_id') || null;

    // Fire the server-side tracking event
    fetch('/api/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        path: url,
        visitorId: visitorId,
        consentId: activeConsentId,
      }),
    }).catch((err) => {
      console.warn('Tracking failed:', err);
    });

  }, [pathname, searchParams, visitorId, consentId]);

  return null; // Invisible component
}
