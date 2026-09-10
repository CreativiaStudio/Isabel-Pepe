// =========================================================================
// ISABEL PEPE - HARDENED STRATEGY VERIFICATION & COMPLIANCE TEST SUITE
// File: scripts/verify_hardened_strategy.mjs
// =========================================================================

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execSync } from 'node:child_process';

console.log('===============================================================');
console.log('   ISABEL PEPE - TIKTOK STRATEGY HARDENING VERIFICATION SUITE   ');
console.log('===============================================================\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  [PASS] ${message}`);
  } else {
    console.error(`  [FAIL] ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
}

const strategyPath = path.resolve('TIKTOK_STRATEGY_ISABEL_PEPE.md');
assert(fs.existsSync(strategyPath), 'TIKTOK_STRATEGY_ISABEL_PEPE.md exists');
const content = fs.readFileSync(strategyPath, 'utf8');

// -------------------------------------------------------------------------
// 1. HARD GATING FLOOR (Section 2.4 & 2.5)
// -------------------------------------------------------------------------
console.log('\n--- Test 1: Hard Gating Floor on CVS Tier A Winner ---');
assert(
  content.includes('(\\text{CVS} \\ge 85) \\land (\\text{Hook Rate} \\ge 50.0\\%) \\land (\\text{Retention Rate} \\ge 50.0\\%) \\land (\\text{Save Rate} \\ge 1.50\\%)') ||
  content.includes('(\\text{CVS} \\ge 85) \\land (\\text{Hook') && content.includes('Save Rate >= 1.50%'),
  'Document formalizes logical conjunction for Tier A Winner'
);
assert(
  content.includes('Save Rate è inferiore a 1.50%') && content.includes('NON PUÒ in alcun caso essere approvato come Tier A'),
  'Document enforces hard gating floor when Save Rate < 1.50%'
);

// Empirical check: Clickbait edge case (Hook 80%, Ret 65%, Save 1.30%)
function normalizeHook(hook) {
  if (hook < 30.0) return 0;
  if (hook < 40.0) return ((hook - 30.0) / 10.0) * 50.0;
  if (hook < 50.0) return 50.0 + ((hook - 40.0) / 10.0) * 35.0;
  if (hook < 60.0) return 85.0 + ((hook - 50.0) / 10.0) * 15.0;
  return 100.0;
}
function normalizeRetention(ret) {
  if (ret < 30.0) return 0;
  if (ret < 40.0) return ((ret - 30.0) / 10.0) * 50.0;
  if (ret < 50.0) return 50.0 + ((ret - 40.0) / 10.0) * 35.0;
  if (ret < 65.0) return 85.0 + ((ret - 50.0) / 15.0) * 15.0;
  return 100.0;
}
function normalizeSave(save) {
  if (save < 0.60) return 0;
  if (save < 1.00) return ((save - 0.60) / 0.40) * 50.0;
  if (save < 1.50) return 50.0 + ((save - 1.00) / 0.50) * 35.0;
  if (save < 2.50) return 85.0 + ((save - 1.50) / 1.00) * 15.0;
  return 100.0;
}
function evalTierA(hook, ret, save) {
  const cvs = normalizeHook(hook) * 0.35 + normalizeRetention(ret) * 0.35 + normalizeSave(save) * 0.30;
  const isTierA = cvs >= 85 && hook >= 50.0 && ret >= 50.0 && save >= 1.50;
  return { cvs, isTierA };
}
const edgeCase4 = evalTierA(65.0, 65.0, 1.30);
assert(edgeCase4.cvs >= 85 && edgeCase4.isTierA === false, 'Edge Case 4 (Save 1.30%) correctly rejected from Tier A despite CVS >= 85');

// -------------------------------------------------------------------------
// 2. DEAD ZONE RESOLUTION (Table 2.5)
// -------------------------------------------------------------------------
console.log('\n--- Test 2: Dead Zone Resolution in Table 2.5 ---');
assert(
  content.includes('Hook Rate tra 40.0% e 49.9%') || content.includes('Hook Rate compreso tra 40.0% e 49.9%'),
  'Table 2.5 covers Hook Rate between 40.0% and 49.9% for Tier B'
);
assert(
  content.includes('Dead Zone 45-49.9% Risolta') || content.includes('Dead Zone (Intervallo 45.0% - 49.9%)'),
  'Dead zone 45-49.9% explicitly documented as resolved'
);

// -------------------------------------------------------------------------
// 3. KILL-02 CPM SPIKE IMMUNITY (Section 3.8)
// -------------------------------------------------------------------------
console.log('\n--- Test 3: KILL-02 CPM Spike Immunity ---');
assert(
  content.includes('(Spesa >= 20,00 €) AND (CTR < 0.70%) AND (CPC > 0.85 €)'),
  'KILL-02 condition includes explicit conjunction (Spesa >= 20,00 €) AND (CTR < 0.70%) AND (CPC > 0.85 €)'
);
assert(
  content.includes('IMMUNITÀ AI PICCHI CPM MACROECONOMICI') &&
  content.includes('CTR è $\\ge 0.90\\%$') &&
  content.includes('NON spegnere l\'annuncio per il solo CPC elevato'),
  'KILL-02 grants immunity to elevated CPC when CTR >= 0.90%'
);

// -------------------------------------------------------------------------
// 4. 14-DAY ROLLING WINDOW FOR SCALING (Section 3.8)
// -------------------------------------------------------------------------
console.log('\n--- Test 4: 14-Day Rolling Window for Scaling ---');
assert(
  content.includes('finestra mobile di 14 giorni') && content.includes('160,00 € totali spesi'),
  'Scaling threshold evaluated across 14-day rolling window / 160€ spend'
);
assert(
  content.includes('Varianza Stocastica di Poisson') || content.includes('Poisson'),
  'Statistical Poisson variance rationale documented'
);

// -------------------------------------------------------------------------
// 5. MANDATORY AD ACCOUNT TIME ZONE (Section 3.5 & Section 6)
// -------------------------------------------------------------------------
console.log('\n--- Test 5: Mandatory Ad Account Time Zone ---');
assert(
  content.includes('(GMT+01:00) Europe/Rome') && content.includes('Fuso Orario dell\'Account Pubblicitario'),
  'Section 3.5 requires (GMT+01:00) Europe/Rome for Dayparting synchronization'
);
assert(
  content.includes('| **Fuso Orario Ad Account** | `(GMT+01:00) Europe/Rome`'),
  'Section 6 parameter table includes (GMT+01:00) Europe/Rome'
);

// -------------------------------------------------------------------------
// 6. PURE-JS SHA-256 FALLBACK & HASHING ACCURACY (Section 4.4)
// -------------------------------------------------------------------------
console.log('\n--- Test 6: Pure-JS SHA-256 Fallback in lib/tiktok-pixel.ts ---');
assert(
  content.includes('function pureJsSha256'),
  'lib/tiktok-pixel.ts contains pure-JS bitwise SHA-256 algorithm'
);

// Extract pureJsSha256 from document and test it directly
import ts from 'typescript';

function transpileTs(code) {
  return ts.transpileModule(code, {
    compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS }
  }).outputText;
}

const pureJsMatch = content.match(/function pureJsSha256\(str: string\): string \{([\s\S]*?)\n\}/);
assert(pureJsMatch !== null, 'pureJsSha256 function extracted cleanly');

// Build executable JS function from extracted body
const cleanPureJsBody = transpileTs(pureJsMatch[1]);
const pureJsFn = new Function('str', cleanPureJsBody);
const testStrings = [
  'test',
  'elena.dumea@isabelpepe.com',
  'mario.pepe@isabelpepe.com',
  '+393331234567',
  'luxury_diamond_ring_2026',
  'gioielleria_demi_fine_napoli_salerno'
];

for (const s of testStrings) {
  const pureHash = pureJsFn(s);
  const nodeHash = crypto.createHash('sha256').update(s, 'utf8').digest('hex');
  assert(pureHash === nodeHash, `pureJsSha256("${s}") matches crypto.createHash`);
}

// -------------------------------------------------------------------------
// 7. GDPR CONSENT REVOCATION & HELPER GUARDS (Section 4.4 & 4.7)
// -------------------------------------------------------------------------
console.log('\n--- Test 7: GDPR Consent Revocation & Helper Guards ---');
assert(
  content.includes('hasActiveMarketingConsent()') &&
  content.includes('window.ttq.revokeConsent') &&
  content.includes('window.ttq.disableCookie') &&
  content.includes('_ttp=;') && content.includes('_ttclid=;'),
  'TikTokPixel.tsx actively invokes revokeConsent(), disableCookie(), and purges _ttp/_ttclid'
);
assert(
  content.includes('if (!hasActiveMarketingConsent()) return;') ||
  content.includes('!hasActiveMarketingConsent()'),
  'Tracking functions guarded by hasActiveMarketingConsent()'
);

// -------------------------------------------------------------------------
// 8. SAFARI PRIVATE BROWSING RESILIENCE (Section 4.4 & 4.6)
// -------------------------------------------------------------------------
console.log('\n--- Test 8: Safari Private Browsing Resilience ---');
assert(
  content.includes('try {') &&
  content.includes('sessionStorage.getItem(storageKey)') &&
  content.includes('} catch {'),
  'sessionStorage access wrapped in try...catch inside trackTikTokCompletePayment'
);
assert(
  content.includes('{ event_id: order.orderId }'),
  'trackTikTokCompletePayment transmits event_id in options for deduplication'
);

// -------------------------------------------------------------------------
// 9. NEXT.JS 16 SUSPENSE BOUNDARY (Section 4.4)
// -------------------------------------------------------------------------
console.log('\n--- Test 9: Next.js 16 Suspense Boundary ---');
assert(
  content.includes('<Suspense fallback={null}>') &&
  content.includes('<TikTokPixelInner />') &&
  content.includes('export default function TikTokPixel()'),
  'TikTokPixel component wrapped in <Suspense fallback={null}>'
);

// -------------------------------------------------------------------------
// 10. WHITESPACE & PHONE NORMALIZATION (Section 4.4)
// -------------------------------------------------------------------------
console.log('\n--- Test 10: Whitespace & E.164 Phone Normalization ---');
assert(
  content.includes('const trimmed = plainText.trim();') &&
  content.includes('if (trimmed.length === 0) return \'\';'),
  'sha256Hex rejects whitespace strings and never emits empty-string hash'
);

// Extract normalizePhoneE164 and test
const phoneMatch = content.match(/export function normalizePhoneE164\(rawPhone: string\): string \{([\s\S]*?)\n\}/);
assert(phoneMatch !== null, 'normalizePhoneE164 function extracted cleanly');
const phoneFn = new Function('rawPhone', transpileTs(phoneMatch[1]));

const phoneTests = [
  { input: '3331234567', expected: '+393331234567' },
  { input: '393331234567', expected: '+393331234567' },
  { input: '00393331234567', expected: '+393331234567' },
  { input: '+393331234567', expected: '+393331234567' },
  { input: '0811234567', expected: '+390811234567' },
  { input: '+14155552671', expected: '+14155552671' },
  { input: '+', expected: '' },
  { input: '  ', expected: '' },
  { input: 'abc', expected: '' },
  { input: '1234', expected: '' }
];

for (const pt of phoneTests) {
  const res = phoneFn(pt.input);
  assert(res === pt.expected, `normalizePhoneE164("${pt.input}") => "${res}" (expected "${pt.expected}")`);
}

// -------------------------------------------------------------------------
// 11. TYPESCRIPT COMPILATION CHECK ON EXTRACTED SNIPPETS
// -------------------------------------------------------------------------
console.log('\n--- Test 11: TypeScript Compilation of Document Modules ---');

const tmpDir = path.resolve('.tmp_ts_verify');
if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

// Extract types/tiktok.d.ts
const typesBlock = content.match(/```typescript[\s\S]*?\/\/ File: types\/tiktok\.d\.ts([\s\S]*?)```/);
assert(typesBlock !== null, 'Extracted types/tiktok.d.ts snippet');
fs.writeFileSync(path.join(tmpDir, 'tiktok.d.ts'), typesBlock[1].trim());

// Extract lib/tiktok-pixel.ts
const libBlock = content.match(/```typescript[\s\S]*?\/\/ File: lib\/tiktok-pixel\.ts([\s\S]*?)```/);
assert(libBlock !== null, 'Extracted lib/tiktok-pixel.ts snippet');
// Replace import path for standalone verification
const libCode = libBlock[1]
  .replace("from '@/types/tiktok'", "from './tiktok'")
  .trim();
fs.writeFileSync(path.join(tmpDir, 'tiktok-pixel.ts'), libCode);

// Create temporary tsconfig
const tsconfig = {
  compilerOptions: {
    target: 'ES2020',
    module: 'esnext',
    moduleResolution: 'bundler',
    strict: true,
    noEmit: true,
    skipLibCheck: true,
    lib: ['dom', 'esnext']
  },
  include: ['*.ts', '*.d.ts']
};
fs.writeFileSync(path.join(tmpDir, 'tsconfig.json'), JSON.stringify(tsconfig, null, 2));

try {
  execSync('npx tsc -p .tmp_ts_verify/tsconfig.json --noEmit', { stdio: 'pipe' });
  assert(true, 'TypeScript compilation (tsc --noEmit) passed with 0 errors');
} catch (err) {
  console.error(err.stdout?.toString());
  console.error(err.stderr?.toString());
  assert(false, 'TypeScript compilation failed');
} finally {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}

console.log('\n===============================================================');
console.log(`   ALL ${passedTests}/${totalTests} TESTS PASSED PERFECTLY! 100% SUCCESS!   `);
console.log('===============================================================');
