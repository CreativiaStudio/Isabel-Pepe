import fs from 'fs';
import path from 'path';

async function runM3Verification() {
  console.log('[TEST] Starting Milestone 3 (Luxury Contact Form Frontend) Verification...\n');
  let passed = 0;
  let total = 0;

  function assert(condition: boolean, description: string) {
    total++;
    if (condition) {
      console.log('[PASS] ' + description);
      passed++;
    } else {
      console.error('[FAIL] ' + description);
    }
  }

  const contactFormPath = path.join(process.cwd(), 'components', 'ContactForm.tsx');
  const fileContent = fs.readFileSync(contactFormPath, 'utf8');

  // 1. Client Component Directive
  assert(fileContent.includes("'use client'"), 'ContactForm is declared as a client component');

  // 2. API Integration
  assert(fileContent.includes("fetch('/api/contact'"), 'ContactForm sends POST request to /api/contact');
  assert(fileContent.includes("method: 'POST'"), 'Request method is POST');
  assert(fileContent.includes("'Content-Type': 'application/json'"), 'Request specifies application/json Content-Type');

  // 3. Honeypot Spam Protection
  assert(fileContent.includes('name="website_hp"'), 'Includes honeypot input field named website_hp');
  assert(fileContent.includes('tabIndex={-1}'), 'Honeypot is removed from keyboard tab sequence');
  assert(fileContent.includes('aria-hidden="true"'), 'Honeypot is hidden from screen readers');
  assert(fileContent.includes('autoComplete="off"'), 'Honeypot disables autocomplete');

  // 4. Loading State & UX
  assert(fileContent.includes('Invio in corso...'), 'Submit button displays "Invio in corso..." during loading');
  assert(fileContent.includes('disabled={loading}'), 'Inputs/Buttons disabled during active submission');
  assert(fileContent.includes('animate-spin'), 'Animated spinner displayed during submission');

  // 5. Error Feedback Banner
  assert(fileContent.includes('role="alert"') && fileContent.includes('errorMessage'), 'Error banner is accessible and displays dynamic error message');
  assert(fileContent.includes('AlertCircle'), 'Error banner uses AlertCircle icon');

  // 6. Luxury Success Screen & Ticket ID
  assert(fileContent.includes('formSubmitted'), 'Manages formSubmitted transition state');
  assert(fileContent.includes('ticketId') && fileContent.includes('ticket_id'), 'Captures and displays ticket_id from API response');
  assert(fileContent.includes('Invia un altro messaggio'), 'Provides button to reset form and send another message');
  assert(fileContent.includes('handleResetForm'), 'Properly resets state upon clicking send another message');
  assert(fileContent.includes('navigator.clipboard'), 'Provides luxury copy functionality for ticket ID');

  // 7. Design Tokens & Styling
  assert(fileContent.includes('#FAF8F5'), 'Uses Isabel Pepe warm canvas palette (#FAF8F5)');
  assert(fileContent.includes('#C0A09A') || fileContent.includes('#8A5E58'), 'Uses Isabel Pepe rose gold accent tokens (#C0A09A / #8A5E58)');
  assert(fileContent.includes('font-serif'), 'Uses luxury Playfair serif typography for headings');
  assert(fileContent.includes('tracking-'), 'Applies luxury letter-spacing tracking tokens');

  // 8. GDPR Privacy Consent
  assert(fileContent.includes('/privacy'), 'Links to Privacy Policy for GDPR compliance');
  assert(fileContent.includes('name="privacy"'), 'Includes mandatory privacy consent checkbox');

  console.log('\n========================================');
  console.log(`M3 SUMMARY: ${passed}/${total} assertions passed`);
  console.log('========================================\n');

  if (passed === total) {
    console.log('[SUCCESS] ALL M3 CONTACT FORM FRONTEND CHECKS PASSED.');
  } else {
    console.error('[ERROR] SOME CHECKS FAILED.');
    process.exit(1);
  }
}

runM3Verification().catch((e) => {
  console.error(e);
  process.exit(1);
});

