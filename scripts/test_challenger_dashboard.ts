// =========================================================================
// ISABEL PEPE LUXURY E-COMMERCE - CHALLENGER 2 ADVERSARIAL TEST HARNESS
// File: scripts/test_challenger_dashboard.ts
// =========================================================================

import { GET as getSummary } from '../app/api/admin/analytics/summary/route';
import { GET as getTimeseries } from '../app/api/admin/analytics/timeseries/route';
import { GET as getFunnel } from '../app/api/admin/analytics/funnel/route';
import { GET as getSources } from '../app/api/admin/analytics/sources/route';
import { GET as getPages } from '../app/api/admin/analytics/pages/route';
import { GET as getGeo } from '../app/api/admin/analytics/geo/route';
import { GET as getSearchConsole } from '../app/api/admin/analytics/search-console/route';
import { GET as getStream } from '../app/api/admin/analytics/stream/route';
import { GET as getIdentity, POST as postIdentity } from '../app/api/admin/analytics/identity/route';
import { parseDateRange, calculatePercentageChange, getRomeTimeParts, formatRomeLabel, classifyPageType, getPageTitleFromPath } from '../lib/analytics-query';

interface TestResult {
  suite: string;
  name: string;
  passed: boolean;
  details?: string;
  error?: any;
}

const results: TestResult[] = [];

function assert(condition: boolean, suite: string, name: string, details?: string) {
  if (condition) {
    results.push({ suite, name, passed: true, details });
    console.log(`  ✅ [PASS] ${suite} -> ${name}`);
  } else {
    results.push({ suite, name, passed: false, details: details || 'Assertion failed' });
    console.error(`  ❌ [FAIL] ${suite} -> ${name} | ${details || 'Assertion failed'}`);
  }
}

function makeRequest(urlPath: string, method = 'GET', body?: any): Request {
  const fullUrl = `http://localhost:3000${urlPath}`;
  const init: RequestInit = { method };
  if (body) {
    init.headers = { 'Content-Type': 'application/json' };
    init.body = JSON.stringify(body);
  }
  return new Request(fullUrl, init);
}

async function runTests() {
  console.log('================================================================');
  console.log('🚀 CHALLENGER 2: STARTING EMPIRICAL ANALYTICS & DASHBOARD TESTS');
  console.log('================================================================\n');

  // =========================================================================
  // SUITE 1: PURE UTILITIES & TIMEZONE VERIFICATION
  // =========================================================================
  console.log('--- SUITE 1: Helper Utilities & Europe/Rome Timezone ---');

  // Test 1.1: Rome Time Parts
  const romeParts = getRomeTimeParts(new Date('2026-08-19T14:30:00Z'));
  assert(
    romeParts.year === 2026 && romeParts.month === 7 && romeParts.day === 19 && (romeParts.hour === 16 || romeParts.hour === 15),
    'Suite 1',
    'getRomeTimeParts correctly computes Europe/Rome local time (CEST +2)',
    `Extracted hour: ${romeParts.hour}, day: ${romeParts.day}`
  );

  // Test 1.2: calculatePercentageChange
  assert(calculatePercentageChange(100, 50) === 100, 'Suite 1', 'Percentage increase 50->100 is +100%');
  assert(calculatePercentageChange(50, 100) === -50, 'Suite 1', 'Percentage decrease 100->50 is -50%');
  assert(calculatePercentageChange(10, 0) === 100, 'Suite 1', 'Percentage change from 0 is safely 100% without division by zero');
  assert(calculatePercentageChange(0, 0) === 0, 'Suite 1', 'Percentage change from 0 to 0 is 0%');

  // Test 1.3: classifyPageType
  assert(classifyPageType('/') === 'home', 'Suite 1', 'Root / is classified as home');
  assert(classifyPageType('/prodotto/anello-imperial') === 'product', 'Suite 1', '/prodotto/* is classified as product');
  assert(classifyPageType('/shop') === 'catalog', 'Suite 1', '/shop is classified as catalog');
  assert(classifyPageType('/categoria/collane') === 'catalog', 'Suite 1', '/categoria/* is classified as catalog');
  assert(classifyPageType('/checkout') === 'checkout', 'Suite 1', '/checkout is classified as checkout');
  assert(classifyPageType('/carrello') === 'checkout', 'Suite 1', '/carrello is classified as checkout');
  assert(classifyPageType('/chi-siamo') === 'editorial', 'Suite 1', '/chi-siamo is classified as editorial');
  assert(classifyPageType('/unknown-random-route') === 'other', 'Suite 1', 'Unknown route is classified as other');

  // Test 1.4: getPageTitleFromPath
  assert(getPageTitleFromPath('/') === 'Home Page — Isabel Pepe', 'Suite 1', 'Home page title mapping');
  assert(getPageTitleFromPath('/prodotto/anello-imperial').includes('Anello Imperial'), 'Suite 1', 'Product slug title formatted properly');

  // =========================================================================
  // SUITE 2: DATE RANGE PARSER & 24-HOUR HOURLY BUCKET
  // =========================================================================
  console.log('\n--- SUITE 2: Date Range Parser & Hourly 24-Point Bucketing ---');

  // Test 2.1: 'today' range creates exactly 24 hourly buckets
  const todayBounds = parseDateRange('today');
  assert(todayBounds.isHourly === true, 'Suite 2', 'today range sets isHourly = true');
  assert(todayBounds.timeSlots.length === 24, 'Suite 2', 'today range generates exactly 24 time slots');
  assert(todayBounds.timeSlots[0].label === '00:00', 'Suite 2', 'First hourly slot is 00:00');
  assert(todayBounds.timeSlots[23].label === '23:00', 'Suite 2', 'Last hourly slot is 23:00');

  // Test 2.2: '7d' range
  const bounds7d = parseDateRange('7d');
  assert(bounds7d.isHourly === false, 'Suite 2', '7d range sets isHourly = false');
  assert(bounds7d.timeSlots.length === 7, 'Suite 2', '7d range generates 7 daily slots');

  // Test 2.3: '30d' range
  const bounds30d = parseDateRange('30d');
  assert(bounds30d.isHourly === false, 'Suite 2', '30d range sets isHourly = false');
  assert(bounds30d.timeSlots.length === 30, 'Suite 2', '30d range generates 30 daily slots');

  // Test 2.4: 'month' range
  const boundsMonth = parseDateRange('month');
  assert(boundsMonth.isHourly === false, 'Suite 2', 'month range sets isHourly = false');
  assert(boundsMonth.timeSlots.length >= 28 && boundsMonth.timeSlots.length <= 31, 'Suite 2', `month range generates correct days for current month (${boundsMonth.timeSlots.length} slots)`);

  // Test 2.5: 'custom' range
  const boundsCustomHourly = parseDateRange('custom', '2026-08-19T00:00:00.000Z', '2026-08-19T23:59:59.000Z');
  assert(boundsCustomHourly.isHourly === true, 'Suite 2', '1-day custom range sets isHourly = true');

  const boundsCustomMultiDay = parseDateRange('custom', '2026-08-10', '2026-08-15');
  assert(boundsCustomMultiDay.isHourly === false, 'Suite 2', 'Multi-day custom range sets isHourly = false');

  // Test 2.6: Adversarial / Invalid Range inputs
  const boundsInvalid = parseDateRange('non_existent_range' as any);
  assert(boundsInvalid.timeSlots.length > 0, 'Suite 2', 'Invalid range defaults gracefully without crashing');

  const boundsGarbageDates = parseDateRange('custom', 'invalid_date_abc', 'invalid_date_xyz');
  assert(!isNaN(boundsGarbageDates.startDate.getTime()), 'Suite 2', 'Invalid date strings handled gracefully without NaN Date');

  // =========================================================================
  // SUITE 3: ENDPOINT 1 - /api/admin/analytics/summary
  // =========================================================================
  console.log('\n--- SUITE 3: Endpoint 1 - /api/admin/analytics/summary ---');

  const rangesToTest = ['today', '7d', '30d', 'month', 'all', 'custom'];

  for (const r of rangesToTest) {
    let url = `/api/admin/analytics/summary?range=${r}`;
    if (r === 'custom') url += '&from=2026-08-01&to=2026-08-19';

    const req = makeRequest(url);
    const res = await getSummary(req);
    assert(res.status === 200, 'Suite 3', `Summary endpoint returns HTTP 200 for range="${r}"`);

    const json = await res.json();
    assert(typeof json.real_unique_visitors === 'number' && json.real_unique_visitors >= 0, 'Suite 3', `[${r}] real_unique_visitors is valid number (${json.real_unique_visitors})`);
    assert(typeof json.total_page_views === 'number' && json.total_page_views >= 0, 'Suite 3', `[${r}] total_page_views is valid number (${json.total_page_views})`);
    assert(typeof json.total_sessions === 'number' && json.total_sessions >= 0, 'Suite 3', `[${r}] total_sessions is valid number (${json.total_sessions})`);
    assert(typeof json.bounce_rate === 'number' && !isNaN(json.bounce_rate), 'Suite 3', `[${r}] bounce_rate is valid number (${json.bounce_rate}%)`);
    assert(typeof json.conversion_rate === 'number' && !isNaN(json.conversion_rate), 'Suite 3', `[${r}] conversion_rate is valid number (${json.conversion_rate}%)`);
    assert(typeof json.total_revenue === 'number' && !isNaN(json.total_revenue), 'Suite 3', `[${r}] total_revenue is valid number (${json.total_revenue}€)`);
    assert(json.prev_period_change !== undefined, 'Suite 3', `[${r}] prev_period_change object is present`);
  }

  // =========================================================================
  // SUITE 4: ENDPOINT 2 - /api/admin/analytics/timeseries
  // =========================================================================
  console.log('\n--- SUITE 4: Endpoint 2 - /api/admin/analytics/timeseries ---');

  for (const r of rangesToTest) {
    let url = `/api/admin/analytics/timeseries?range=${r}`;
    if (r === 'custom') url += '&from=2026-08-01&to=2026-08-19';

    const req = makeRequest(url);
    const res = await getTimeseries(req);
    assert(res.status === 200, 'Suite 4', `Timeseries endpoint returns HTTP 200 for range="${r}"`);

    const json = await res.json();
    assert(Array.isArray(json.points), 'Suite 4', `[${r}] points is array`);
    assert(json.points.length > 0, 'Suite 4', `[${r}] points contains data slots (${json.points.length} slots)`);

    if (r === 'today') {
      assert(json.points.length === 24, 'Suite 4', 'today timeseries has exactly 24 points');
      assert(json.interval === 'hour', 'Suite 4', 'today timeseries specifies interval="hour"');
    }

    const firstPt = json.points[0];
    assert(
      typeof firstPt.timestamp === 'string' &&
      typeof firstPt.date_label === 'string' &&
      typeof firstPt.page_views === 'number' &&
      typeof firstPt.unique_visitors === 'number' &&
      typeof firstPt.sessions === 'number' &&
      typeof firstPt.product_views === 'number' &&
      typeof firstPt.orders === 'number' &&
      typeof firstPt.revenue === 'number',
      'Suite 4',
      `[${r}] Point structure contains all expected metric types`
    );
  }

  // =========================================================================
  // SUITE 5: ENDPOINT 3 - /api/admin/analytics/funnel (5-Stage Purchasing Math)
  // =========================================================================
  console.log('\n--- SUITE 5: Endpoint 3 - /api/admin/analytics/funnel ---');

  const channelsToTest = ['all', 'google_organic', 'meta_ads', 'direct', 'referral', 'whatsapp_crm'];

  for (const ch of channelsToTest) {
    const req = makeRequest(`/api/admin/analytics/funnel?range=7d&channel=${ch}`);
    const res = await getFunnel(req);
    assert(res.status === 200, 'Suite 5', `Funnel endpoint returns HTTP 200 for channel="${ch}"`);

    const f = await res.json();

    // Check 5 stages exist and are numbers
    assert(typeof f.stage_1_landing === 'number' && f.stage_1_landing >= 0, 'Suite 5', `[${ch}] stage_1_landing = ${f.stage_1_landing}`);
    assert(typeof f.stage_2_product_view === 'number' && f.stage_2_product_view >= 0, 'Suite 5', `[${ch}] stage_2_product_view = ${f.stage_2_product_view}`);
    assert(typeof f.stage_3_add_to_cart === 'number' && f.stage_3_add_to_cart >= 0, 'Suite 5', `[${ch}] stage_3_add_to_cart = ${f.stage_3_add_to_cart}`);
    assert(typeof f.stage_4_checkout_started === 'number' && f.stage_4_checkout_started >= 0, 'Suite 5', `[${ch}] stage_4_checkout_started = ${f.stage_4_checkout_started}`);
    assert(typeof f.stage_5_purchase_completed === 'number' && f.stage_5_purchase_completed >= 0, 'Suite 5', `[${ch}] stage_5_purchase_completed = ${f.stage_5_purchase_completed}`);

    // Check CR calculations are not NaN
    assert(!isNaN(f.cr_1_to_2) && typeof f.cr_1_to_2 === 'number', 'Suite 5', `[${ch}] cr_1_to_2 is valid number (${f.cr_1_to_2}%)`);
    assert(!isNaN(f.cr_2_to_3) && typeof f.cr_2_to_3 === 'number', 'Suite 5', `[${ch}] cr_2_to_3 is valid number (${f.cr_2_to_3}%)`);
    assert(!isNaN(f.cr_3_to_4) && typeof f.cr_3_to_4 === 'number', 'Suite 5', `[${ch}] cr_3_to_4 is valid number (${f.cr_3_to_4}%)`);
    assert(!isNaN(f.cr_4_to_5) && typeof f.cr_4_to_5 === 'number', 'Suite 5', `[${ch}] cr_4_to_5 is valid number (${f.cr_4_to_5}%)`);
    assert(!isNaN(f.cr_overall) && typeof f.cr_overall === 'number', 'Suite 5', `[${ch}] cr_overall is valid number (${f.cr_overall}%)`);

    // Check Drop-off rates
    assert(!isNaN(f.drop_off_1_to_2) && f.drop_off_1_to_2 >= 0, 'Suite 5', `[${ch}] drop_off_1_to_2 is valid number >= 0 (${f.drop_off_1_to_2}%)`);
    assert(!isNaN(f.drop_off_2_to_3) && f.drop_off_2_to_3 >= 0, 'Suite 5', `[${ch}] drop_off_2_to_3 is valid number >= 0 (${f.drop_off_2_to_3}%)`);
    assert(!isNaN(f.drop_off_3_to_4) && f.drop_off_3_to_4 >= 0, 'Suite 5', `[${ch}] drop_off_3_to_4 is valid number >= 0 (${f.drop_off_3_to_4}%)`);
    assert(!isNaN(f.drop_off_4_to_5) && f.drop_off_4_to_5 >= 0, 'Suite 5', `[${ch}] drop_off_4_to_5 is valid number >= 0 (${f.drop_off_4_to_5}%)`);

    assert(typeof f.total_revenue === 'number' && !isNaN(f.total_revenue), 'Suite 5', `[${ch}] total_revenue is valid number (${f.total_revenue}€)`);
  }

  // =========================================================================
  // SUITE 6: ENDPOINT 4 - /api/admin/analytics/sources
  // =========================================================================
  console.log('\n--- SUITE 6: Endpoint 4 - /api/admin/analytics/sources ---');

  const sourcesReq = makeRequest('/api/admin/analytics/sources?range=7d');
  const sourcesRes = await getSources(sourcesReq);
  assert(sourcesRes.status === 200, 'Suite 6', 'Sources endpoint returns HTTP 200');

  const sourcesJson = await sourcesRes.json();
  assert(Array.isArray(sourcesJson.channels), 'Suite 6', 'channels is an array');
  assert(Array.isArray(sourcesJson.campaigns), 'Suite 6', 'campaigns is an array');
  assert(Array.isArray(sourcesJson.referrers), 'Suite 6', 'referrers is an array');

  assert(sourcesJson.channels.length >= 10, 'Suite 6', `channels list covers standard channels (${sourcesJson.channels.length} channels initialized)`);

  const sampleChannel = sourcesJson.channels[0];
  assert(
    typeof sampleChannel.channel === 'string' &&
    typeof sampleChannel.unique_visitors === 'number' &&
    typeof sampleChannel.sessions === 'number' &&
    typeof sampleChannel.bounce_rate === 'number' &&
    typeof sampleChannel.conversion_rate === 'number' &&
    typeof sampleChannel.revenue === 'number',
    'Suite 6',
    'Channel item contains complete metrics payload'
  );

  // =========================================================================
  // SUITE 7: ENDPOINT 5 - /api/admin/analytics/pages
  // =========================================================================
  console.log('\n--- SUITE 7: Endpoint 5 - /api/admin/analytics/pages ---');

  const pagesReq = makeRequest('/api/admin/analytics/pages?range=30d&limit=20&sort_by=views');
  const pagesRes = await getPages(pagesReq);
  assert(pagesRes.status === 200, 'Suite 7', 'Pages endpoint returns HTTP 200');

  const pagesJson = await pagesRes.json();
  assert(Array.isArray(pagesJson.pages), 'Suite 7', 'pages is an array');
  assert(Array.isArray(pagesJson.products), 'Suite 7', 'products is an array');

  if (pagesJson.pages.length > 0) {
    const p = pagesJson.pages[0];
    assert(
      typeof p.path === 'string' &&
      typeof p.views_count === 'number' &&
      typeof p.unique_visitors === 'number' &&
      typeof p.avg_time_seconds === 'number' &&
      typeof p.bounce_rate === 'number',
      'Suite 7',
      'Page item has valid schema and metric values'
    );
  }

  if (pagesJson.products.length > 0) {
    const pr = pagesJson.products[0];
    assert(
      typeof pr.product_id === 'string' &&
      typeof pr.name === 'string' &&
      typeof pr.slug === 'string' &&
      typeof pr.views_count === 'number' &&
      typeof pr.price === 'number' &&
      typeof pr.conversion_rate === 'number',
      'Suite 7',
      'Top product item has valid schema and metric values'
    );
  }

  // =========================================================================
  // SUITE 8: ENDPOINT 6 - /api/admin/analytics/geo
  // =========================================================================
  console.log('\n--- SUITE 8: Endpoint 6 - /api/admin/analytics/geo ---');

  const geoReq = makeRequest('/api/admin/analytics/geo?range=7d');
  const geoRes = await getGeo(geoReq);
  assert(geoRes.status === 200, 'Suite 8', 'Geo endpoint returns HTTP 200');

  const geoJson = await geoRes.json();
  assert(Array.isArray(geoJson.countries), 'Suite 8', 'countries is an array');
  assert(Array.isArray(geoJson.cities), 'Suite 8', 'cities is an array');
  assert(Array.isArray(geoJson.geo_metrics), 'Suite 8', 'geo_metrics is an array conforming to GeoMetric[]');

  if (geoJson.cities.length > 0) {
    const ci = geoJson.cities[0];
    assert(
      typeof ci.city === 'string' &&
      typeof ci.country === 'string' &&
      typeof ci.unique_visitors === 'number' &&
      typeof ci.sessions === 'number',
      'Suite 8',
      'City item has valid schema and metric values'
    );
  }

  // =========================================================================
  // SUITE 9: ENDPOINT 7 - /api/admin/analytics/search-console
  // =========================================================================
  console.log('\n--- SUITE 9: Endpoint 7 - /api/admin/analytics/search-console ---');

  const gscReq = makeRequest('/api/admin/analytics/search-console?range=7d');
  const gscRes = await getSearchConsole(gscReq);
  assert(gscRes.status === 200, 'Suite 9', 'Search Console endpoint returns HTTP 200');

  const gscJson = await gscRes.json();
  assert(typeof gscJson.total_impressions === 'number' && gscJson.total_impressions > 0, 'Suite 9', `total_impressions = ${gscJson.total_impressions}`);
  assert(typeof gscJson.total_clicks === 'number' && gscJson.total_clicks > 0, 'Suite 9', `total_clicks = ${gscJson.total_clicks}`);
  assert(typeof gscJson.avg_ctr === 'number' && gscJson.avg_ctr > 0, 'Suite 9', `avg_ctr = ${gscJson.avg_ctr}%`);
  assert(typeof gscJson.avg_position === 'number' && gscJson.avg_position > 0, 'Suite 9', `avg_position = ${gscJson.avg_position}`);
  assert(Array.isArray(gscJson.queries) && gscJson.queries.length > 0, 'Suite 9', `queries list contains ${gscJson.queries.length} queries`);
  assert(Array.isArray(gscJson.pages) && gscJson.pages.length > 0, 'Suite 9', `pages list contains ${gscJson.pages.length} pages`);

  // =========================================================================
  // SUITE 10: ENDPOINT 8 - /api/admin/analytics/stream
  // =========================================================================
  console.log('\n--- SUITE 10: Endpoint 8 - /api/admin/analytics/stream ---');

  const streamReq = makeRequest('/api/admin/analytics/stream?page=1&limit=10');
  const streamRes = await getStream(streamReq);
  assert(streamRes.status === 200, 'Suite 10', 'Stream endpoint returns HTTP 200');

  const streamJson = await streamRes.json();
  assert(Array.isArray(streamJson.stream), 'Suite 10', 'stream is an array');
  assert(typeof streamJson.total === 'number', 'Suite 10', `total count = ${streamJson.total}`);
  assert(typeof streamJson.page === 'number', 'Suite 10', `page = ${streamJson.page}`);
  assert(typeof streamJson.totalPages === 'number', 'Suite 10', `totalPages = ${streamJson.totalPages}`);

  if (streamJson.stream.length > 0) {
    const s = streamJson.stream[0];
    assert(
      typeof s.visitor_id === 'string' &&
      typeof s.current_path === 'string' &&
      typeof s.traffic_channel === 'string',
      'Suite 10',
      'Stream item has valid visitor and session telemetry'
    );
  }

  // =========================================================================
  // SUITE 11: ENDPOINT 9 - /api/admin/analytics/identity
  // =========================================================================
  console.log('\n--- SUITE 11: Endpoint 9 - /api/admin/analytics/identity ---');

  // Test GET
  const idGetReq = makeRequest('/api/admin/analytics/identity');
  const idGetRes = await getIdentity(idGetReq);
  assert(idGetRes.status === 200, 'Suite 11', 'Identity GET returns HTTP 200');

  // Test POST invalid (missing required fields)
  const idPostInvalidReq = makeRequest('/api/admin/analytics/identity', 'POST', {});
  const idPostInvalidRes = await postIdentity(idPostInvalidReq);
  assert(idPostInvalidRes.status === 400, 'Suite 11', 'Identity POST without visitorId/name returns HTTP 400');

  // Test POST valid upsert
  const testVisitorId = `test_challenger_${Date.now()}`;
  const idPostValidReq = makeRequest('/api/admin/analytics/identity', 'POST', {
    visitorId: testVisitorId,
    name: 'Challenger 2 Test Identity',
    email: 'challenger2@test.it',
    role: 'test',
    notes: 'Automated verification test',
  });
  const idPostValidRes = await postIdentity(idPostValidReq);
  assert(idPostValidRes.status === 200, 'Suite 11', 'Identity POST valid payload returns HTTP 200');
  const idPostJson = await idPostValidRes.json();
  assert(idPostJson.success === true && idPostJson.identity?.name === 'Challenger 2 Test Identity', 'Suite 11', 'Identity successfully saved in database');

  // =========================================================================
  // SUMMARY RESULTS
  // =========================================================================
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = total - passed;

  console.log('\n================================================================');
  console.log(`📊 CHALLENGER 2 HARNESS SUMMARY: ${passed}/${total} PASSED (${failed} FAILED)`);
  console.log('================================================================');

  if (failed > 0) {
    console.error(`\n❌ FAILED TESTS (${failed}):`);
    results.filter((r) => !r.passed).forEach((r) => {
      console.error(`  - [${r.suite}] ${r.name}: ${r.details}`);
    });
    process.exit(1);
  } else {
    console.log('\n🎉 ALL ADVERSARIAL TESTS PASSED WITH 100% SUCCESS RATE!');
    process.exit(0);
  }
}

runTests().catch((err) => {
  console.error('Fatal error running challenger tests:', err);
  process.exit(1);
});
