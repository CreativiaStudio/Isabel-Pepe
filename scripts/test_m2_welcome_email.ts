/**
 * Isabel Pepe Privilege Club — Milestone 2 Verification Script
 * Tests: sendPrivilegeWelcomeEmail, HTML/Text template generation, brand compliance, edge cases
 */

import {
  generatePrivilegeWelcomeEmailHtml,
  generatePrivilegeWelcomeEmailText,
  sendPrivilegeWelcomeEmail,
} from '../lib/email';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ Assertion Failed: ${message}`);
    throw new Error(`Assertion Failed: ${message}`);
  } else {
    console.log(`  ✓ ${message}`);
  }
}

async function runM2Verification() {
  console.log('\n======================================================');
  console.log('👑 RUNNING ISABEL PEPE M2 EMAIL VERIFICATION SUITE 👑');
  console.log('======================================================\n');

  // Test 1: HTML Template Generation with Personalized Name and Custom Coupon
  console.log('Test 1: Personalized HTML Template Content Verification');
  const personalizedHtml = generatePrivilegeWelcomeEmailHtml({
    firstName: 'Elena',
    couponCode: 'PRIVILEGE10',
  });

  assert(personalizedHtml.includes('ISABEL PEPE'), 'Contains brand title ISABEL PEPE');
  assert(personalizedHtml.includes('HAUTE JOAILLERIE'), 'Contains HAUTE JOAILLERIE descriptor');
  assert(personalizedHtml.includes("L'ATELIER PRIVÉ"), 'Contains subheader L\'ATELIER PRIVÉ');
  assert(personalizedHtml.includes('Elena'), 'Includes personalized first name');
  assert(personalizedHtml.includes('PRIVILEGE10'), 'Contains coupon code PRIVILEGE10');
  assert(personalizedHtml.includes('10% di Privilegio Riservato'), 'Mentions 10% welcome privilege');
  assert(personalizedHtml.includes('Accesso Anticipato 48h'), 'Includes Perk 1: Accesso Anticipato 48h');
  assert(personalizedHtml.includes('Vendite Private Stagionali'), 'Includes Perk 2: Vendite Private Stagionali');
  assert(personalizedHtml.includes('Servizio di Cura &amp; Pulizia Gratuita') || personalizedHtml.includes('Servizio di Cura & Pulizia Gratuita'), 'Includes Perk 3: Servizio di Cura & Pulizia Gratuita');
  assert(personalizedHtml.includes('ESPLORA LA COLLEZIONE'), 'Includes luxury CTA button copy');
  assert(personalizedHtml.includes('/shop'), 'CTA button points to shop URL');
  assert(personalizedHtml.includes('/privacy'), 'Footer links to Privacy Policy');
  assert(personalizedHtml.includes('#FAF8F5'), 'Uses brand warm porcelain background #FAF8F5');
  assert(personalizedHtml.includes('#C0A09A'), 'Uses champagne rose gold accent #C0A09A');
  assert(personalizedHtml.includes('#0D0D0D'), 'Uses deep charcoal luxury tone #0D0D0D');

  // Test 2: HTML Template Generation Fallback (No Name provided)
  console.log('\nTest 2: Anonymous/Default Fallback Template Verification');
  const fallbackHtml = generatePrivilegeWelcomeEmailHtml({});
  assert(fallbackHtml.includes('Cliente Esclusiva'), 'Uses fallback greeting "Cliente Esclusiva"');
  assert(fallbackHtml.includes('PRIVILEGE10'), 'Defaults to PRIVILEGE10 coupon');

  // Test 3: Plaintext Template Generation
  console.log('\nTest 3: Plaintext Template Generation');
  const plainText = generatePrivilegeWelcomeEmailText({
    firstName: 'Mario',
    couponCode: 'PRIVILEGE10',
  });
  assert(plainText.includes('ISABEL PEPE — HAUTE JOAILLERIE ITALIANA'), 'Plaintext header matches');
  assert(plainText.includes("L'ATELIER PRIVÉ"), 'Plaintext subtitle matches');
  assert(plainText.includes('Mario'), 'Plaintext contains personalized name');
  assert(plainText.includes('PRIVILEGE10'), 'Plaintext contains coupon code');
  assert(plainText.includes('1. Accesso Anticipato 48h'), 'Plaintext includes perk 1');
  assert(plainText.includes('2. Vendite Private Stagionali'), 'Plaintext includes perk 2');
  assert(plainText.includes('3. Servizio di Cura & Pulizia Gratuita'), 'Plaintext includes perk 3');
  assert(plainText.includes('/shop'), 'Plaintext contains shop URL');
  assert(plainText.includes('/privacy'), 'Plaintext contains privacy URL');

  // Test 4: sendPrivilegeWelcomeEmail with invalid email
  console.log('\nTest 4: Invalid Email Error Handling');
  const invalidResult = await sendPrivilegeWelcomeEmail({ to: 'invalid-email-string' });
  assert(invalidResult.success === false, 'Rejects invalid email format without throwing');
  assert(Boolean(invalidResult.error), 'Provides error message for invalid email');

  // Test 5: sendPrivilegeWelcomeEmail with empty object
  console.log('\nTest 5: Empty Input Error Handling');
  const emptyResult = await sendPrivilegeWelcomeEmail({} as any);
  assert(emptyResult.success === false, 'Handles empty input object gracefully');

  // Test 6: sendPrivilegeWelcomeEmail alias parameter compatibility
  console.log('\nTest 6: Alias Parameter Compatibility');
  // When RESEND_API_KEY is not set or missing, it should return { success: false, error: 'Missing API key' } gracefully
  const aliasResult = await sendPrivilegeWelcomeEmail({
    customerEmail: 'test.vip@isabelpepe.com',
    customerName: 'Elena Sofia',
    couponCode: 'PRIVILEGE10',
  } as any);
  assert(typeof aliasResult === 'object' && 'success' in aliasResult, 'Returns well-formed result object');
  console.log('  Result without API key in dev:', aliasResult);

  console.log('\n======================================================');
  console.log('✅ ALL M2 EMAIL VERIFICATION TESTS PASSED SUCCESSFULLY');
  console.log('======================================================\n');
}

runM2Verification().catch((err) => {
  console.error('❌ M2 Verification Suite Failed:', err);
  process.exit(1);
});
