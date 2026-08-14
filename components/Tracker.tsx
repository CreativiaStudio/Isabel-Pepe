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

  useEffect(() => {
    // Generate or retrieve visitor ID from localStorage
    let currentVisitorId = localStorage.getItem('isabel_visitor_id');
    if (!currentVisitorId) {
      currentVisitorId = generateVisitorId();
      localStorage.setItem('isabel_visitor_id', currentVisitorId);
    }
    setVisitorId(currentVisitorId);
  }, []);

  useEffect(() => {
    if (!visitorId || !pathname) return;

    // Build the full path
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');

    // Fire the tracking event
    fetch('/api/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        path: url,
        visitorId: visitorId,
      }),
    }).catch((err) => {
      // Silently fail on tracking errors to not disrupt user experience
      console.warn('Tracking failed:', err);
    });

  }, [pathname, searchParams, visitorId]);

  return null; // Invisible component
}
