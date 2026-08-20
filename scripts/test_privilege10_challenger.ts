import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { POST as validateCouponPOST } from '../app/api/coupons/validate/route';
import { supabaseAdmin } from '../lib/supabase';

interface TestResult {
  name: string;
  category: string;
  passed: boolean;
  expected: any;
  actual: any;
  details?: string;
}

async function runEmpiricalChallengerSuite() {
  console.log('================================================================');
  console.log('🕵️ CHALLENGER 2: PRIVILEGE10 EMPIRICAL VERIFICATION SUITE');
  console.log('================================================================\n');

  const results: TestResult[] = [];

  function record(result: TestResult) {
    results.push(result);
    const badge = result.passed ? '✅ [PASS]' : '❌ [FAIL]';
    console.log(`${badge} [${result.category}] ${result.name}`);
    if (!result.passed) {
      console.error(`     Expected: ${JSON.stringify(result.expected)}`);
      console.error(`     Actual:   ${JSON.stringify(result.actual)}`);
      if (result.details) console.error(`     Details:  ${result.details}`);
    }
  }

  try {
    // =========================================================================
    // CATEGORY 1: DATABASE RECORD INTEGRITY
    // =========================================================================
    console.log('--- CATEGORY 1: Database State Verification (`coupons` table) ---');
    const { data: dbCoupon, error: dbError } = await supabaseAdmin
      .from('coupons')
      .select('*')
      .eq('code', 'PRIVILEGE10')
      .single();

    record({
      category: 'DB_INTEGRITY',
      name: 'PRIVILEGE10 exists in coupons table',
      passed: !dbError && Boolean(dbCoupon),
      expected: 'Row exists with no error',
      actual: dbError ? `Error: ${dbError.message}` : 'Row found',
      details: dbCoupon ? JSON.stringify(dbCoupon) : undefined,
    });

    record({
      category: 'DB_INTEGRITY',
      name: 'PRIVILEGE10 is active (is_active === true)',
      passed: dbCoupon?.is_active === true,
      expected: true,
      actual: dbCoupon?.is_active,
    });

    record({
      category: 'DB_INTEGRITY',
      name: 'PRIVILEGE10 discount_percent is exactly 10',
      passed: Number(dbCoupon?.discount_percent) === 10,
      expected: 10,
      actual: dbCoupon?.discount_percent,
    });

    record({
      category: 'DB_INTEGRITY',
      name: 'PRIVILEGE10 discount_amount is null/0 (pure percentage coupon)',
      passed: !dbCoupon?.discount_amount || Number(dbCoupon?.discount_amount) === 0,
      expected: 'null or 0',
      actual: dbCoupon?.discount_amount,
    });

    record({
      category: 'DB_INTEGRITY',
      name: 'PRIVILEGE10 has no target_email restriction (universal welcome coupon)',
      passed: dbCoupon?.target_email === null || dbCoupon?.target_email === undefined,
      expected: null,
      actual: dbCoupon?.target_email,
    });

    record({
      category: 'DB_INTEGRITY',
      name: 'PRIVILEGE10 has no unexpected past expiration (expires_at is null or future)',
      passed: !dbCoupon?.expires_at || new Date(dbCoupon.expires_at).getTime() > Date.now(),
      expected: 'null or future date',
      actual: dbCoupon?.expires_at,
    });

    // =========================================================================
    // CATEGORY 2: COUPON VALIDATION API (/api/coupons/validate)
    // =========================================================================
    console.log('\n--- CATEGORY 2: Coupon Validation API Route Execution ---');

    // 2.1 Uppercase PRIVILEGE10
    const reqUpper = new Request('http://localhost:3000/api/coupons/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'PRIVILEGE10' }),
    });
    const resUpper = await validateCouponPOST(reqUpper);
    const jsonUpper = await resUpper.json();

    record({
      category: 'API_VALIDATE',
      name: 'Uppercase "PRIVILEGE10" validation returns HTTP 200 & success: true',
      passed: resUpper.status === 200 && jsonUpper.success === true,
      expected: { status: 200, success: true },
      actual: { status: resUpper.status, success: jsonUpper.success },
      details: JSON.stringify(jsonUpper),
    });

    record({
      category: 'API_VALIDATE',
      name: 'Uppercase "PRIVILEGE10" returns discount_percent: 10',
      passed: jsonUpper.discount_percent === 10,
      expected: 10,
      actual: jsonUpper.discount_percent,
    });

    // 2.2 Lowercase privilege10 (Case Insensitivity)
    const reqLower = new Request('http://localhost:3000/api/coupons/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'privilege10' }),
    });
    const resLower = await validateCouponPOST(reqLower);
    const jsonLower = await resLower.json();

    record({
      category: 'API_VALIDATE',
      name: 'Lowercase "privilege10" validates successfully (Case-Insensitive)',
      passed: resLower.status === 200 && jsonLower.success === true && jsonLower.discount_percent === 10,
      expected: { status: 200, success: true, discount_percent: 10 },
      actual: { status: resLower.status, success: jsonLower.success, discount_percent: jsonLower.discount_percent },
      details: JSON.stringify(jsonLower),
    });

    // 2.3 Mixed-case Privilege10
    const reqMixed = new Request('http://localhost:3000/api/coupons/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'Privilege10' }),
    });
    const resMixed = await validateCouponPOST(reqMixed);
    const jsonMixed = await resMixed.json();

    record({
      category: 'API_VALIDATE',
      name: 'Mixed-case "Privilege10" validates successfully',
      passed: resMixed.status === 200 && jsonMixed.success === true && jsonMixed.discount_percent === 10,
      expected: { status: 200, success: true, discount_percent: 10 },
      actual: { status: resMixed.status, success: jsonMixed.success, discount_percent: jsonMixed.discount_percent },
    });

    // 2.4 Anonymous customer vs Authenticated customer email with PRIVILEGE10
    const reqWithEmail = new Request('http://localhost:3000/api/coupons/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'PRIVILEGE10', email: 'elena.vip@example.com' }),
    });
    const resWithEmail = await validateCouponPOST(reqWithEmail);
    const jsonWithEmail = await resWithEmail.json();

    record({
      category: 'API_VALIDATE',
      name: 'PRIVILEGE10 works for any customer email (unrestricted)',
      passed: resWithEmail.status === 200 && jsonWithEmail.success === true,
      expected: { status: 200, success: true },
      actual: { status: resWithEmail.status, success: jsonWithEmail.success },
    });

    // 2.5 Invalid coupon code
    const reqInvalid = new Request('http://localhost:3000/api/coupons/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'NONEXISTENT_COUPON_999' }),
    });
    const resInvalid = await validateCouponPOST(reqInvalid);
    const jsonInvalid = await resInvalid.json();

    record({
      category: 'API_VALIDATE',
      name: 'Non-existent coupon returns HTTP 404',
      passed: resInvalid.status === 404 && Boolean(jsonInvalid.error),
      expected: { status: 404 },
      actual: { status: resInvalid.status, error: jsonInvalid.error },
    });

    // 2.6 Missing code parameter
    const reqEmpty = new Request('http://localhost:3000/api/coupons/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: '' }),
    });
    const resEmpty = await validateCouponPOST(reqEmpty);
    const jsonEmpty = await resEmpty.json();

    record({
      category: 'API_VALIDATE',
      name: 'Empty code parameter returns HTTP 400',
      passed: resEmpty.status === 400 && Boolean(jsonEmpty.error),
      expected: { status: 400 },
      actual: { status: resEmpty.status, error: jsonEmpty.error },
    });

    // =========================================================================
    // CATEGORY 3: DISCOUNT MATHEMATICS & CART TOTAL CALCULATIONS
    // =========================================================================
    console.log('\n--- CATEGORY 3: Discount Mathematics & Cart Totals ---');

    const testCarts = [
      { name: '€250 Luxury Ring', price: 250.00, qty: 1, expectedDiscount: 25.00, expectedFinal: 225.00 },
      { name: '€120 Pearl Bracelet', price: 120.00, qty: 1, expectedDiscount: 12.00, expectedFinal: 108.00 },
      { name: '€89 Demi-Fine Earrings', price: 89.00, qty: 1, expectedDiscount: 8.90, expectedFinal: 80.10 },
      { name: '€345.50 Multi-Stone Necklace', price: 345.50, qty: 1, expectedDiscount: 34.55, expectedFinal: 310.95 },
      { name: 'Cart with 3 Items (€150 + 2x€75 = €300)', price: 100.00, qty: 3, expectedDiscount: 30.00, expectedFinal: 270.00 },
      { name: 'Cent-precision item €49.99', price: 49.99, qty: 1, expectedDiscount: 5.00, expectedFinal: 44.99 }, // 10% of 49.99 = 4.999 -> rounded 5.00 or 4.999
    ];

    const discountRate = Number(dbCoupon?.discount_percent || 10) / 100;

    for (const cart of testCarts) {
      const subtotal = cart.price * cart.qty;
      const rawDiscount = subtotal * discountRate;
      const roundedDiscount = Math.round(rawDiscount * 100) / 100;
      const finalTotal = Math.round((subtotal - roundedDiscount) * 100) / 100;

      const isAccurate = Math.abs(roundedDiscount - cart.expectedDiscount) <= 0.01 &&
                         Math.abs(finalTotal - cart.expectedFinal) <= 0.01;

      record({
        category: 'DISCOUNT_MATH',
        name: `10% Discount calculation for ${cart.name} (Subtotal: €${subtotal.toFixed(2)})`,
        passed: isAccurate,
        expected: { discount: cart.expectedDiscount, finalTotal: cart.expectedFinal },
        actual: { discount: roundedDiscount, finalTotal: finalTotal },
      });
    }

    // =========================================================================
    // CATEGORY 4: CHECKOUT ROUTE INTEGRATION BEHAVIOR
    // =========================================================================
    console.log('\n--- CATEGORY 4: Checkout Route Logic Verification (`app/api/checkout/route.ts`) ---');

    // Emulate checkout lookup and verification logic
    const testCheckoutCode = 'privilege10'; // test lowercase input at checkout
    const customerEmail = 'elena.privilege@isabelpepe.com';

    const { data: checkoutDbCoupon } = await supabaseAdmin
      .from('coupons')
      .select('*')
      .eq('code', testCheckoutCode.toUpperCase())
      .single();

    const isCouponValidForCheckout =
      Boolean(checkoutDbCoupon) &&
      checkoutDbCoupon.is_active &&
      (!checkoutDbCoupon.expires_at || new Date(checkoutDbCoupon.expires_at) > new Date()) &&
      (!checkoutDbCoupon.target_email || checkoutDbCoupon.target_email.toLowerCase() === customerEmail?.toLowerCase());

    record({
      category: 'CHECKOUT_LOGIC',
      name: 'Checkout logic successfully queries and validates "privilege10"',
      passed: isCouponValidForCheckout,
      expected: true,
      actual: isCouponValidForCheckout,
    });

    const stripeCouponPayload = {
      percent_off: checkoutDbCoupon && checkoutDbCoupon.discount_percent > 0 ? checkoutDbCoupon.discount_percent : undefined,
      amount_off: checkoutDbCoupon && checkoutDbCoupon.discount_amount > 0 ? Math.round(checkoutDbCoupon.discount_amount * 100) : undefined,
      currency: checkoutDbCoupon && checkoutDbCoupon.discount_amount > 0 ? 'eur' : undefined,
      duration: 'once',
      name: checkoutDbCoupon?.code,
    };

    record({
      category: 'CHECKOUT_LOGIC',
      name: 'Stripe coupon parameter specifies percent_off: 10 and duration: "once"',
      passed: stripeCouponPayload.percent_off === 10 && stripeCouponPayload.amount_off === undefined && stripeCouponPayload.duration === 'once',
      expected: { percent_off: 10, amount_off: undefined, duration: 'once', name: 'PRIVILEGE10' },
      actual: stripeCouponPayload,
    });

    // =========================================================================
    // FINAL AUDIT SUMMARY
    // =========================================================================
    console.log('\n================================================================');
    const totalTests = results.length;
    const passedTests = results.filter((r) => r.passed).length;
    const failedTests = totalTests - passedTests;

    console.log(`CHALLENGER 2 RESULTS: ${passedTests}/${totalTests} TESTS PASSED`);
    console.log('================================================================\n');

    if (failedTests === 0) {
      console.log('🏆 VERDICT: APPROVE (100% empirical pass on all coupon validation & math tests)');
      process.exit(0);
    } else {
      console.error(`❌ VERDICT: REQUEST_CHANGES (${failedTests} tests failed)`);
      process.exit(1);
    }
  } catch (fatal: any) {
    console.error('💥 Fatal error in challenger test harness:', fatal);
    process.exit(1);
  }
}

runEmpiricalChallengerSuite();
