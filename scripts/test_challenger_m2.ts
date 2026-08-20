/**
 * Isabel Pepe Privilege Club — Milestone 2 Empirical Challenger Test Suite
 * Author: Empirical Challenger (Challenger M2.1)
 * Purpose: Exhaustive empirical verification of sendPrivilegeWelcomeEmail & HTML/Text template generation
 */

import {
  generatePrivilegeWelcomeEmailHtml,
  generatePrivilegeWelcomeEmailText,
  sendPrivilegeWelcomeEmail,
  PrivilegeWelcomeEmailParams,
} from '../lib/email';

interface TestStats {
  passed: number;
  failed: number;
  tests: Array<{ name: string; status: 'PASS' | 'FAIL'; details?: string }>;
}

const stats: TestStats = {
  passed: 0,
  failed: 0,
  tests: [],
};

function recordTest(name: string, condition: boolean, details?: string) {
  if (condition) {
    stats.passed++;
    stats.tests.push({ name, status: 'PASS' });
    console.log(`  ✅ PASS: ${name}`);
  } else {
    stats.failed++;
    stats.tests.push({ name, status: 'FAIL', details });
    console.error(`  ❌ FAIL: ${name} — ${details || 'Condition false'}`);
  }
}

async function runChallengerSuite() {
  console.log('================================================================');
  console.log('💎 STARTING EMPIRICAL CHALLENGER VERIFICATION: MILESTONE 2 💎');
  console.log('================================================================\n');

  // -------------------------------------------------------------
  // TEST GROUP 1: HTML Template Rendering & Personalization
  // -------------------------------------------------------------
  console.log('--- TEST GROUP 1: HTML Template Rendering & Personalization ---');
  
  // 1.1 Custom Name & Custom Coupon
  const htmlCustom = generatePrivilegeWelcomeEmailHtml({
    firstName: 'Elena Sofia',
    couponCode: 'WELCOME20',
  });
  recordTest('HTML contains personalized full first name', htmlCustom.includes('Elena Sofia'));
  recordTest('HTML contains custom coupon code', htmlCustom.includes('WELCOME20'));
  recordTest('HTML contains brand title "ISABEL PEPE"', htmlCustom.includes('ISABEL PEPE'));
  recordTest('HTML contains "HAUTE JOAILLERIE ITALIANA"', htmlCustom.includes('HAUTE JOAILLERIE ITALIANA'));
  recordTest('HTML contains "L\'ATELIER PRIVÉ"', htmlCustom.includes("L'ATELIER PRIVÉ"));
  recordTest('HTML contains "10% di Privilegio Riservato"', htmlCustom.includes('10% di Privilegio Riservato'));

  // 1.2 Default / Anonymous Fallback
  const htmlDefault = generatePrivilegeWelcomeEmailHtml({});
  recordTest('HTML uses fallback "Cliente Esclusiva" when name omitted', htmlDefault.includes('Cliente Esclusiva'));
  recordTest('HTML defaults to "PRIVILEGE10" when couponCode omitted', htmlDefault.includes('PRIVILEGE10'));

  // 1.3 Whitespace trimming
  const htmlWhitespace = generatePrivilegeWelcomeEmailHtml({ firstName: '   Isabella   ' });
  recordTest('HTML trims whitespace around name', htmlWhitespace.includes('<strong>Isabella</strong>'));

  // 1.4 Empty string name fallback
  const htmlEmptyString = generatePrivilegeWelcomeEmailHtml({ firstName: '   ' });
  recordTest('HTML falls back to "Cliente Esclusiva" on all-whitespace name', htmlEmptyString.includes('Cliente Esclusiva'));

  // -------------------------------------------------------------
  // TEST GROUP 2: Atelier Perks in HTML and Plain Text
  // -------------------------------------------------------------
  console.log('\n--- TEST GROUP 2: Atelier Perks in HTML and Plain Text ---');

  const perk1Title = 'Accesso Anticipato 48h';
  const perk1Desc = 'Scopri in anteprima assoluta le nuove collezioni';
  const perk2Title = 'Vendite Private Stagionali';
  const perk2Desc = 'Inviti esclusivi agli appuntamenti di vendita privata';
  const perk3Title = 'Servizio di Cura';
  const perk3Desc = 'Assistenza a vita e trattamento di lucidatura professionale';

  recordTest('HTML includes Perk 1 Title & Description', htmlCustom.includes(perk1Title) && htmlCustom.includes(perk1Desc));
  recordTest('HTML includes Perk 2 Title & Description', htmlCustom.includes(perk2Title) && htmlCustom.includes(perk2Desc));
  recordTest('HTML includes Perk 3 Title & Description', htmlCustom.includes(perk3Title) && htmlCustom.includes(perk3Desc));

  const textCustom = generatePrivilegeWelcomeEmailText({
    firstName: 'Elena Sofia',
    couponCode: 'WELCOME20',
  });
  recordTest('Text includes Perk 1', textCustom.includes('1. Accesso Anticipato 48h') && textCustom.includes(perk1Desc));
  recordTest('Text includes Perk 2', textCustom.includes('2. Vendite Private Stagionali') && textCustom.includes(perk2Desc));
  recordTest('Text includes Perk 3', textCustom.includes('3. Servizio di Cura & Pulizia Gratuita') && textCustom.includes(perk3Desc));
  recordTest('Text includes personalized name', textCustom.includes('Gentile Elena Sofia,'));
  recordTest('Text includes custom coupon code', textCustom.includes('CODICE COUPON: WELCOME20'));

  const textDefault = generatePrivilegeWelcomeEmailText({});
  recordTest('Text defaults to "Cliente Esclusiva"', textDefault.includes('Gentile Cliente Esclusiva,'));
  recordTest('Text defaults to "PRIVILEGE10"', textDefault.includes('CODICE COUPON: PRIVILEGE10'));

  // -------------------------------------------------------------
  // TEST GROUP 3: Responsive Styling, Inline CSS & Email Client Compatibility
  // -------------------------------------------------------------
  console.log('\n--- TEST GROUP 3: Responsive Styling & Email Client Compatibility ---');

  recordTest('HTML has <!DOCTYPE html>', htmlCustom.startsWith('<!DOCTYPE html>'));
  recordTest('HTML contains viewport meta tag', htmlCustom.includes('<meta name="viewport" content="width=device-width, initial-scale=1.0">'));
  recordTest('HTML contains X-UA-Compatible meta tag for Outlook/IE', htmlCustom.includes('<meta http-equiv="X-UA-Compatible" content="IE=edge">'));
  recordTest('HTML contains table with max-width: 600px', htmlCustom.includes('max-width: 600px'));
  recordTest('HTML uses champagne rose gold accent color #C0A09A', htmlCustom.includes('#C0A09A'));
  recordTest('HTML uses deep charcoal luxury color #0D0D0D', htmlCustom.includes('#0D0D0D'));
  recordTest('HTML uses warm background porcelain #FAF8F5', htmlCustom.includes('#FAF8F5'));
  recordTest('HTML CTA button has link to /shop', htmlCustom.includes('/shop'));
  recordTest('HTML CTA button has uppercase copy "ESPLORA LA COLLEZIONE"', htmlCustom.includes('ESPLORA LA COLLEZIONE'));
  recordTest('HTML Footer has Privacy Policy link', htmlCustom.includes('/privacy'));
  recordTest('HTML Footer has Unsubscribe link', htmlCustom.includes('/privacy#unsubscribe'));

  // -------------------------------------------------------------
  // TEST GROUP 4: Parameter Flexibility & Resilience in sendPrivilegeWelcomeEmail
  // -------------------------------------------------------------
  console.log('\n--- TEST GROUP 4: Parameter Flexibility & Error Resilience ---');

  // 4.1 Standard params { to, firstName, couponCode }
  const res1 = await sendPrivilegeWelcomeEmail({
    to: 'test1@isabelpepe.com',
    firstName: 'Alessandra',
    couponCode: 'PRIVILEGE10',
  });
  recordTest('Standard params returns structured result', typeof res1 === 'object' && typeof res1.success === 'boolean');

  // 4.2 Route.ts alias params { customerEmail, customerName, couponCode }
  const res2 = await sendPrivilegeWelcomeEmail({
    customerEmail: 'test2@isabelpepe.com',
    customerName: 'Beatrice Valli',
    couponCode: 'PRIVILEGE10',
  } as PrivilegeWelcomeEmailParams);
  recordTest('Route.ts alias params returns structured result', typeof res2 === 'object' && typeof res2.success === 'boolean');

  // 4.3 Email alias { email, firstName }
  const res3 = await sendPrivilegeWelcomeEmail({
    email: 'test3@isabelpepe.com',
    firstName: 'Chiara',
  } as PrivilegeWelcomeEmailParams);
  recordTest('email alias params returns structured result', typeof res3 === 'object' && typeof res3.success === 'boolean');

  // -------------------------------------------------------------
  // TEST GROUP 5: Invalid Inputs & Error Boundary (No Crashes)
  // -------------------------------------------------------------
  console.log('\n--- TEST GROUP 5: Invalid Inputs & Boundary Cases ---');

  // 5.1 Invalid email string
  const errRes1 = await sendPrivilegeWelcomeEmail({ to: 'not-an-email' });
  recordTest('Rejects non-email string without crashing', errRes1.success === false && Boolean(errRes1.error));

  // 5.2 Empty email string
  const errRes2 = await sendPrivilegeWelcomeEmail({ to: '' });
  recordTest('Rejects empty email string', errRes2.success === false);

  // 5.3 Empty object
  const errRes3 = await sendPrivilegeWelcomeEmail({} as any);
  recordTest('Handles empty object gracefully without throw', errRes3.success === false);

  // 5.4 Null / undefined input
  const errRes4 = await sendPrivilegeWelcomeEmail(null as any);
  recordTest('Handles null input gracefully without throw', errRes4.success === false);

  // 5.5 Non-string email
  const errRes5 = await sendPrivilegeWelcomeEmail({ to: 12345 as any });
  recordTest('Handles non-string email gracefully', errRes5.success === false);

  // -------------------------------------------------------------
  // TEST GROUP 6: Fallback when RESEND_API_KEY is Missing or Invalid
  // -------------------------------------------------------------
  console.log('\n--- TEST GROUP 6: API Key Fallback Simulation ---');

  // If RESEND_API_KEY is not set in env, sendEmail returns { success: false, error: 'Missing API key' }
  const missingKeyRes = await sendPrivilegeWelcomeEmail({ to: 'valid@example.com' });
  if (!process.env.RESEND_API_KEY) {
    recordTest('Missing RESEND_API_KEY returns { success: false, error: "Missing API key" }', 
      missingKeyRes.success === false && missingKeyRes.error === 'Missing API key'
    );
  } else {
    recordTest('With RESEND_API_KEY, returns valid object without unhandled exception',
      typeof missingKeyRes.success === 'boolean'
    );
  }

  // -------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------
  console.log('\n================================================================');
  console.log(`📊 CHALLENGER SUMMARY: ${stats.passed} PASSED, ${stats.failed} FAILED (Total: ${stats.passed + stats.failed})`);
  console.log('================================================================\n');

  if (stats.failed > 0) {
    console.error(`🚨 ${stats.failed} tests failed! Review outputs above.`);
    process.exit(1);
  } else {
    console.log('🏆 All empirical tests passed with zero defects.');
  }
}

runChallengerSuite().catch((err) => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
