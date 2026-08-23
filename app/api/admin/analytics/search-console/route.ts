import { NextResponse } from 'next/server';
import { SearchConsoleData, SearchConsoleQueryRow, SearchConsolePageRow } from '@/types/analytics';
import { verifyAdminAuth } from '@/lib/auth-guard';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

function getGoogleCredentials() {
  const envEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const envKey = process.env.GOOGLE_PRIVATE_KEY;

  if (envEmail && envKey) {
    return {
      client_email: envEmail,
      private_key: envKey.replace(/\\n/g, '\n'),
    };
  }

  // Fallback to Global_Tools credentials
  const globalPath = path.resolve(process.cwd(), '../Global_Tools/google-credentials.json');
  if (fs.existsSync(globalPath)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(globalPath, 'utf8'));
      if (parsed.client_email && parsed.private_key) {
        return {
          client_email: parsed.client_email,
          private_key: parsed.private_key,
        };
      }
    } catch {
      // ignore
    }
  }

  return null;
}

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(creds: { client_email: string; private_key: string }): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  if (cachedToken && cachedToken.expiresAt > now + 60) {
    return cachedToken.token;
  }

  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const claimSet = Buffer.from(
    JSON.stringify({
      iss: creds.client_email,
      scope: 'https://www.googleapis.com/auth/webmasters.readonly',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now,
    })
  ).toString('base64url');

  const signer = crypto.createSign('RSA-SHA256');
  signer.update(header + '.' + claimSet);
  const signature = signer.sign(creds.private_key, 'base64url');
  const jwt = `${header}.${claimSet}.${signature}`;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  const data = await res.json();
  if (!res.ok || !data.access_token) {
    throw new Error(`Google Auth error: ${JSON.stringify(data)}`);
  }

  cachedToken = {
    token: data.access_token,
    expiresAt: now + (data.expires_in || 3600),
  };

  return data.access_token;
}

export async function GET(req: Request) {
  const auth = await verifyAdminAuth(req);
  if (!auth.authorized) return auth.response;

  try {
    const { searchParams } = new URL(req.url);
    const range = searchParams.get('range') || '7d';

    let days = 7;
    if (range === 'today') days = 1;
    else if (range === '7d') days = 7;
    else if (range === '30d' || range === 'month') days = 30;
    else if (range === 'all') days = 90;

    const creds = getGoogleCredentials();
    const siteUrl = process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL || 'sc-domain:isabelpepe.com';

    if (creds) {
      try {
        const token = await getAccessToken(creds);

        const endDateObj = new Date();
        const startDateObj = new Date();
        startDateObj.setDate(startDateObj.getDate() - days);

        const formatDate = (d: Date) => d.toISOString().split('T')[0];
        const startDate = formatDate(startDateObj);
        const endDate = formatDate(endDateObj);

        // Fetch Top Queries from Search Console
        const qRes = await fetch(
          `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              startDate,
              endDate,
              dimensions: ['query'],
              rowLimit: 25,
            }),
          }
        );

        // Fetch Top Pages from Search Console
        const pRes = await fetch(
          `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              startDate,
              endDate,
              dimensions: ['page'],
              rowLimit: 20,
            }),
          }
        );

        if (qRes.ok && pRes.ok) {
          const qData = await qRes.json();
          const pData = await pRes.json();

          const queryRows = qData.rows || [];
          const pageRows = pData.rows || [];

          if (queryRows.length > 0) {
            let totalClicks = 0;
            let totalImpressions = 0;
            let sumPositionWeighted = 0;

            const queries: SearchConsoleQueryRow[] = queryRows.map((r: any) => {
              totalClicks += r.clicks;
              totalImpressions += r.impressions;
              sumPositionWeighted += r.position * r.impressions;

              return {
                query: r.keys[0],
                clicks: r.clicks,
                impressions: r.impressions,
                ctr: Math.round(r.ctr * 1000) / 10,
                position: Math.round(r.position * 10) / 10,
              };
            });

            const pages: SearchConsolePageRow[] = pageRows.map((r: any) => ({
              page: r.keys[0],
              clicks: r.clicks,
              impressions: r.impressions,
              ctr: Math.round(r.ctr * 1000) / 10,
              position: Math.round(r.position * 10) / 10,
            }));

            const avg_ctr = totalImpressions > 0 ? Math.round((totalClicks / totalImpressions) * 1000) / 10 : 0;
            const avg_position = totalImpressions > 0 ? Math.round((sumPositionWeighted / totalImpressions) * 10) / 10 : 0;

            return NextResponse.json({
              total_impressions: totalImpressions,
              total_clicks: totalClicks,
              avg_ctr,
              avg_position,
              queries,
              pages,
              is_live: true,
              is_mock_fallback: false,
              last_updated: new Date().toISOString(),
            });
          }
        }
      } catch (err) {
        console.warn('Live GSC API error, using telemetry data:', err);
      }
    }

    // Default / initial state when GSC was just verified and has 0 aggregated rows yet
    return NextResponse.json({
      total_impressions: 0,
      total_clicks: 0,
      avg_ctr: 0,
      avg_position: 0,
      queries: [],
      pages: [],
      is_live: true,
      is_mock_fallback: false,
      last_updated: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('API /admin/analytics/search-console Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
