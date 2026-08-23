import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { runTier5Tests } from '../tests/concierge/tier5_adversarial_security';

async function main() {
  const globalStart = Date.now();

  console.log('\n\x1b[1m\x1b[35m========================================================================\x1b[0m');
  console.log('\x1b[1m\x1b[35m   🛡️  ISABEL PEPE TIER 5 ADVERSARIAL & SECURITY STRESS HARNESS 🛡️      \x1b[0m');
  console.log('\x1b[1m\x1b[35m========================================================================\x1b[0m');

  const runner = await runTier5Tests();
  const summary = runner.summary();
  const totalTime = Date.now() - globalStart;

  console.log('\n\x1b[1m\x1b[36m========================================================================\x1b[0m');
  console.log('\x1b[1m\x1b[36m             TIER 5 ADVERSARIAL STRESS TEST SUMMARY REPORT              \x1b[0m');
  console.log('\x1b[1m\x1b[36m========================================================================\x1b[0m');

  const results = runner.getResults();
  for (const r of results) {
    const badge = r.passed ? '\x1b[32m[PASS]\x1b[0m' : '\x1b[31m[FAIL]\x1b[0m';
    console.log(` ${badge} ${r.name.padEnd(76)} \x1b[90m(${r.durationMs}ms)\x1b[0m`);
    if (!r.passed && r.error) {
      console.log(`        \x1b[31mError: ${r.error}\x1b[0m`);
    }
  }

  console.log('\x1b[36m------------------------------------------------------------------------\x1b[0m');
  console.log(
    ` Total Tests: \x1b[1m${summary.total}\x1b[0m | Passed: \x1b[32m\x1b[1m${summary.passed}\x1b[0m | Failed: ${
      summary.failed > 0 ? `\x1b[31m\x1b[1m${summary.failed}\x1b[0m` : '\x1b[32m0\x1b[0m'
    } | Total Wall Time: \x1b[1m${totalTime}ms\x1b[0m`
  );
  console.log('\x1b[1m\x1b[35m========================================================================\x1b[0m\n');

  if (summary.failed > 0) {
    console.error('\x1b[31m❌ Tier 5 Adversarial Stress Tests FAILED. Review issues above.\x1b[0m\n');
    process.exit(1);
  } else {
    console.log('\x1b[32m✨ ALL TIER 5 ADVERSARIAL & SECURITY STRESS TESTS PASSED EMPIRICALLY! ✨\x1b[0m\n');
    process.exit(0);
  }
}

main().catch((err) => {
  console.error('\x1b[31mFatal error in Tier 5 adversarial runner:\x1b[0m', err);
  process.exit(1);
});
