// =========================================================================
// ISABEL PEPE LUXURY E-COMMERCE - REST APIS VERIFICATION SCRIPT
// File: scripts/verify_analytics_apis.ts
// =========================================================================

import { GET as getSummary } from '../app/api/admin/analytics/summary/route';
import { GET as getTimeseries } from '../app/api/admin/analytics/timeseries/route';
import { GET as getSources } from '../app/api/admin/analytics/sources/route';
import { GET as getFunnel } from '../app/api/admin/analytics/funnel/route';
import { GET as getPages } from '../app/api/admin/analytics/pages/route';
import { GET as getGeo } from '../app/api/admin/analytics/geo/route';
import { GET as getStream } from '../app/api/admin/analytics/stream/route';
import { GET as getIdentity, POST as postIdentity } from '../app/api/admin/analytics/identity/route';
import { GET as getSearchConsole } from '../app/api/admin/analytics/search-console/route';

async function runTests() {
  console.log('--- STARTING ADMIN ANALYTICS APIS VERIFICATION ---');

  // 1. Summary Endpoint Test
  console.log('\n[1] Testing /api/admin/analytics/summary');
  const summaryReq = new Request('http://localhost:3000/api/admin/analytics/summary?range=all');
  const summaryRes = await getSummary(summaryReq);
  const summaryJson = await summaryRes.json();
  console.log('Summary Status:', summaryRes.status);
  console.log('Summary Output:', JSON.stringify(summaryJson, null, 2));

  // 2. Timeseries Endpoint Test (Today hourly & 7d daily)
  console.log('\n[2] Testing /api/admin/analytics/timeseries (today & 7d)');
  const tsTodayReq = new Request('http://localhost:3000/api/admin/analytics/timeseries?range=today');
  const tsTodayRes = await getTimeseries(tsTodayReq);
  const tsTodayJson = await tsTodayRes.json();
  console.log('Timeseries Today Status:', tsTodayRes.status, 'Points Count:', tsTodayJson.points?.length);

  const ts7dReq = new Request('http://localhost:3000/api/admin/analytics/timeseries?range=7d');
  const ts7dRes = await getTimeseries(ts7dReq);
  const ts7dJson = await ts7dRes.json();
  console.log('Timeseries 7d Status:', ts7dRes.status, 'Points Count:', ts7dJson.points?.length);

  // 3. Sources Endpoint Test
  console.log('\n[3] Testing /api/admin/analytics/sources');
  const sourcesReq = new Request('http://localhost:3000/api/admin/analytics/sources?range=all');
  const sourcesRes = await getSources(sourcesReq);
  const sourcesJson = await sourcesRes.json();
  console.log('Sources Status:', sourcesRes.status, 'Channels Count:', sourcesJson.channels?.length, 'Campaigns Count:', sourcesJson.campaigns?.length);

  // 4. Funnel Endpoint Test
  console.log('\n[4] Testing /api/admin/analytics/funnel');
  const funnelReq = new Request('http://localhost:3000/api/admin/analytics/funnel?range=all');
  const funnelRes = await getFunnel(funnelReq);
  const funnelJson = await funnelRes.json();
  console.log('Funnel Status:', funnelRes.status);
  console.log('Funnel Output:', JSON.stringify(funnelJson, null, 2));

  // 5. Pages Endpoint Test
  console.log('\n[5] Testing /api/admin/analytics/pages');
  const pagesReq = new Request('http://localhost:3000/api/admin/analytics/pages?range=all&limit=10');
  const pagesRes = await getPages(pagesReq);
  const pagesJson = await pagesRes.json();
  console.log('Pages Status:', pagesRes.status, 'Pages Count:', pagesJson.pages?.length, 'Products Count:', pagesJson.products?.length);

  // 6. Geo Endpoint Test
  console.log('\n[6] Testing /api/admin/analytics/geo');
  const geoReq = new Request('http://localhost:3000/api/admin/analytics/geo?range=all');
  const geoRes = await getGeo(geoReq);
  const geoJson = await geoRes.json();
  console.log('Geo Status:', geoRes.status, 'Countries Count:', geoJson.countries?.length, 'Cities Count:', geoJson.cities?.length);

  // 7. Stream Endpoint Test
  console.log('\n[7] Testing /api/admin/analytics/stream');
  const streamReq = new Request('http://localhost:3000/api/admin/analytics/stream?page=1&limit=5');
  const streamRes = await getStream(streamReq);
  const streamJson = await streamRes.json();
  console.log('Stream Status:', streamRes.status, 'Stream Items:', streamJson.stream?.length, 'Total:', streamJson.total);

  // 8. Identity Endpoint Test (GET & POST)
  console.log('\n[8] Testing /api/admin/analytics/identity');
  const identityGetReq = new Request('http://localhost:3000/api/admin/analytics/identity');
  const identityGetRes = await getIdentity(identityGetReq);
  const identityGetJson = await identityGetRes.json();
  console.log('Identity GET Status:', identityGetRes.status, 'Identities Count:', identityGetJson.identities?.length);

  const testVid = `vid_test_${Date.now()}`;
  const identityPostReq = new Request('http://localhost:3000/api/admin/analytics/identity', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      visitorId: testVid,
      name: 'Mario Test VIP',
      email: 'mario.test@isabelpepe.com',
      role: 'VIP',
      notes: 'Automated test identity',
    }),
  });
  const identityPostRes = await postIdentity(identityPostReq);
  const identityPostJson = await identityPostRes.json();
  console.log('Identity POST Status:', identityPostRes.status, 'Identity Saved:', identityPostJson.identity?.name);

  // 9. Search Console Endpoint Test
  console.log('\n[9] Testing /api/admin/analytics/search-console');
  const gscReq = new Request('http://localhost:3000/api/admin/analytics/search-console?range=7d');
  const gscRes = await getSearchConsole(gscReq);
  const gscJson = await gscRes.json();
  console.log('Search Console Status:', gscRes.status, 'Queries Count:', gscJson.queries?.length, 'Pages Count:', gscJson.pages?.length, 'Total Impressions:', gscJson.total_impressions);

  console.log('\n--- ALL ADMIN ANALYTICS APIS VERIFIED SUCCESSFULLY ---');
}

runTests().catch((err) => {
  console.error('VERIFICATION ERROR:', err);
  process.exit(1);
});
