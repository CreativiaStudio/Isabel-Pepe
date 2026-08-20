import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { runTier1Tests } from '../tests/privilege-club/tier1-feature-coverage.test';
import { runTier2Tests } from '../tests/privilege-club/tier2-boundary-corner-cases.test';
import { runTier3Tests } from '../tests/privilege-club/tier3-cross-feature-combinations.test';
import { runTier4Tests } from '../tests/privilege-club/tier4-real-world-scenarios.test';

async function main() {
  const globalStart = Date.now();

  console.log('\n\x1b[1m\x1b[35m========================================================================\x1b[0m');
  console.log('\x1b[1m\x1b[35m       💎 ISABEL PEPE PRIVILEGE CLUB — 4-TIER E2E TEST SUITE 💎          \x1b[0m');
  console.log('\x1b[1m\x1b[35m========================================================================\x1b[0m');

  const runners = [
    await runTier1Tests(),
    await runTier2Tests(),
    await runTier3Tests(),
    await runTier4Tests(),
  ];

  const totalTime = Date.now() - globalStart;

  let totalTests = 0;
  let totalPassed = 0;
  let totalFailed = 0;

  console.log('\n\x1b[1m\x1b[36m========================================================================\x1b[0m');
  console.log('\x1b[1m\x1b[36m                         E2E TEST SUMMARY REPORT                        \x1b[0m');
  console.log('\x1b[1m\x1b[36m========================================================================\x1b[0m');

  for (const runner of runners) {
    const s = runner.summary();
    totalTests += s.total;
    totalPassed += s.passed;
    totalFailed += s.failed;

    const statusBadge = s.failed === 0 ? '\x1b[32m[PASS]\x1b[0m' : '\x1b[31m[FAIL]\x1b[0m';
    const suiteName = runner.getResults()[0]?.suite || 'Test Suite';
    console.log(` ${statusBadge} ${suiteName.padEnd(48)}: ${s.passed}/${s.total} passed in ${s.totalDurationMs}ms`);
  }

  console.log('\x1b[36m------------------------------------------------------------------------\x1b[0m');
  console.log(
    ` Total Tests: \x1b[1m${totalTests}\x1b[0m | Passed: \x1b[32m\x1b[1m${totalPassed}\x1b[0m | Failed: ${
      totalFailed > 0 ? `\x1b[31m\x1b[1m${totalFailed}\x1b[0m` : '\x1b[32m0\x1b[0m'
    } | Total Wall Time: \x1b[1m${totalTime}ms\x1b[0m`
  );
  console.log('\x1b[1m\x1b[35m========================================================================\x1b[0m\n');

  if (totalFailed > 0) {
    console.error('\x1b[31m❌ Some E2E tests failed. Please review failure details above.\x1b[0m\n');
    process.exit(1);
  } else {
    console.log('\x1b[32m✨ ALL 4 TIERS OF ISABEL PEPE PRIVILEGE CLUB E2E SUITE PASSED! ✨\x1b[0m\n');
    process.exit(0);
  }
}

main().catch((err) => {
  console.error('\x1b[31mFatal error running E2E test suite:\x1b[0m', err);
  process.exit(1);
});
