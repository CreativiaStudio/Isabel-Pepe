// =========================================================================
// ISABEL PEPE LUXURY E-COMMERCE - BOT IMMUNE FILTER LIBRARY
// File: lib/bot-filter.ts
// =========================================================================

import { ClientTelemetry } from '@/types/analytics';

/**
 * Level 1: Master List of Bot / Crawler / Scraper User-Agent Regular Expressions
 */
export const BOT_USER_AGENT_PATTERNS: RegExp[] = [
  // 1. Major Search Engine Crawlers
  /googlebot/i,
  /bingbot/i,
  /slurp/i,
  /duckduckbot/i,
  /baiduspider/i,
  /yandexbot/i,
  /sogou/i,
  /exabot/i,
  /ia_archiver/i,
  /facebot/i,
  /ecosia/i,
  /qwantify/i,
  /yoozbot/i,

  // 2. SEO, Backlink & Auditing Crawlers
  /ahrefsbot/i,
  /semrushbot/i,
  /dotbot/i,
  /mj12bot/i,
  /screaming frog/i,
  /petalbot/i,
  /megaindex/i,
  /zoominfobot/i,
  /dataforseobot/i,
  /serpstatbot/i,
  /sistrix/i,
  /seokicks/i,
  /blexbot/i,
  /seznambot/i,
  /linkdexbot/i,
  /seekport/i,
  /cognitiveseo/i,
  /sitebulb/i,

  // 3. AI, LLM & Data Scrapers
  /bytespider/i,
  /gptbot/i,
  /chatgpt-user/i,
  /claudebot/i,
  /claude-web/i,
  /anthropic-ai/i,
  /perplexitybot/i,
  /ccbot/i,
  /google-extended/i,
  /amazonbot/i,
  /diffbot/i,
  /scrapy/i,
  /cohere-ai/i,
  /omgilibot/i,
  /omgili/i,
  /applebot-extended/i,
  /meta-externalagent/i,
  /facebookbot/i,
  /timpibot/i,
  /youbot/i,

  // 4. Social Preview & Chat Crawlers (Links unfurling, not human visitors)
  /facebookexternalhit/i,
  /twitterbot/i,
  /linkedinbot/i,
  /whatsapp/i,
  /telegrambot/i,
  /pinterestbot/i,
  /pinterest/i,
  /discordbot/i,
  /slackbot/i,
  /skypeuripreview/i,
  /applebot/i,
  /viber/i,
  /vkshare/i,
  /quora link preview/i,

  // 5. Headless Browsers & Automation Frameworks
  /headlesschrome/i,
  /puppeteer/i,
  /playwright/i,
  /selenium/i,
  /phantomjs/i,
  /webdriver/i,
  /cypress/i,
  /nightwatch/i,
  /electron/i,
  /ghost/i,

  // 6. HTTP Libraries, CLI Tools & Scripting Languages
  /^curl/i,
  /^wget/i,
  /python-requests/i,
  /python-urllib/i,
  /aiohttp/i,
  /httpx/i,
  /node-fetch/i,
  /undici/i,
  /axios/i,
  /got\//i,
  /superagent/i,
  /go-http-client/i,
  /postmanruntime/i,
  /httpie/i,
  /java\//i,
  /apache-httpclient/i,
  /libwww-perl/i,
  /okhttp/i,
  /guzzlehttp/i,
  /ruby/i,
  /insomnia/i,

  // 7. Uptime & Performance Monitoring
  /uptimerobot/i,
  /pingdom/i,
  /better uptime/i,
  /statuscake/i,
  /site24x7/i,
  /vercel-og/i,
  /vercel-screenshot/i,
  /lighthouse/i,
  /pagespeed/i,
  /gtmetrix/i,
  /webpagetest/i,
  /newrelicpings/i,
  /datadog/i,

  // Generic crawler / spider fallback
  /\bbot\b/i,
  /\bcrawler\b/i,
  /\bspider\b/i,
];

/**
 * Returns true if the User-Agent string matches any known bot pattern.
 */
export function isBotUserAgent(userAgent: string | null | undefined): boolean {
  if (!userAgent || userAgent.trim().length === 0) {
    return true; // Missing User-Agent is almost always automated traffic
  }

  const cleanUa = userAgent.trim();
  for (const pattern of BOT_USER_AGENT_PATTERNS) {
    if (pattern.test(cleanUa)) {
      return true;
    }
  }

  return false;
}

/**
 * Checks client-side telemetry signals for browser automation / headless anomalies.
 */
export function isClientBotSignal(telemetry?: ClientTelemetry | null): boolean {
  if (!telemetry) return false;

  // 1. Explicit webdriver flag from browser navigator
  if (telemetry.is_webdriver === true) {
    return true;
  }

  // 2. Zero or anomalous screen dimensions (common in headless virtual scrapers)
  if (telemetry.viewport_width === 0 || telemetry.viewport_height === 0) {
    return true;
  }

  if (telemetry.screen_resolution === '0x0' || telemetry.screen_resolution === '0 x 0') {
    return true;
  }

  return false;
}

/**
 * Client-Side Automation Detector (Runs in browser before dispatching /api/track)
 */
export function detectClientAutomation(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    // 1. navigator.webdriver
    if (navigator.webdriver) return true;

    // 2. Document WebDriver attribute
    if (document.documentElement.getAttribute('webdriver')) return true;

    // 3. Headless Chrome flags
    if ((window as any).chrome && !navigator.languages) return true;

    // 4. Selenium / Phantom / Nightmare injection keys
    if (
      (window as any).__nightmare ||
      (window as any)._phantom ||
      (window as any).callPhantom ||
      (window as any).__selenium_unwrapped ||
      (window as any).domAutomation ||
      (window as any).domAutomationController
    ) {
      return true;
    }

    // 5. Zero screen resolution
    if (window.screen.width === 0 || window.screen.height === 0) {
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

/**
 * Local IP addresses and development loopbacks
 */
const EXCLUDED_IPS = new Set([
  '127.0.0.1',
  '::1',
  'localhost',
  '0.0.0.0',
  '::ffff:127.0.0.1',
]);

/**
 * Checks if the request IP is a local development or loopback address.
 */
export function isExcludedIp(ip: string | null | undefined): boolean {
  if (!ip) return false;
  const cleanIp = ip.split(',')[0].trim().toLowerCase();
  return EXCLUDED_IPS.has(cleanIp);
}

/**
 * System paths that should never generate public customer page views or analytics events.
 */
export const EXCLUDED_PATH_PREFIXES = [
  '/admin',
  '/api',
  '/_next',
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
  '/sitemap',
  '/manifest.json',
  '/_vercel',
];

/**
 * Checks if a given URL path is an internal / admin / asset route.
 */
export function isExcludedPath(path: string | null | undefined): boolean {
  if (!path) return true;
  const normalized = path.toLowerCase().trim();
  return EXCLUDED_PATH_PREFIXES.some((prefix) => normalized.startsWith(prefix));
}

/**
 * Comprehensive Evaluation: determines whether a tracking request should be completely ignored.
 */
export function shouldIgnoreTracking(options: {
  userAgent?: string | null;
  ip?: string | null;
  path?: string | null;
  clientTelemetry?: ClientTelemetry;
  isAdminSuppressed?: boolean;
}): { ignore: boolean; reason?: string } {
  const { userAgent, ip, path, clientTelemetry, isAdminSuppressed } = options;

  // 1. Admin UI suppression (e.g. localStorage 'isabel_admin_ignore')
  if (isAdminSuppressed) {
    return { ignore: true, reason: 'admin_suppressed' };
  }

  // 2. Internal / Admin / Static paths
  if (path && isExcludedPath(path)) {
    return { ignore: true, reason: 'excluded_path' };
  }

  // 3. User-Agent Bot Regex
  if (isBotUserAgent(userAgent)) {
    return { ignore: true, reason: 'bot_user_agent' };
  }

  // 4. Client automation signals
  if (isClientBotSignal(clientTelemetry)) {
    return { ignore: true, reason: 'client_automation_signal' };
  }

  // 5. Development IP check (only in non-production or if explicitly requested)
  if (process.env.NODE_ENV === 'development' && ip && isExcludedIp(ip)) {
    return { ignore: true, reason: 'localhost_ip_development' };
  }

  return { ignore: false };
}
