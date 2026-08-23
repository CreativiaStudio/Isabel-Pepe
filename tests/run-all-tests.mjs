#!/usr/bin/env node

/**
 * Isabel Pepe E2E Test Suite Master Runner
 * Usage: node tests/run-all-tests.mjs
 */

import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const relativeScriptPath = 'tests/upload-gallery/run-suite.ts';

console.log('\x1b[36m🚀 Starting Isabel Pepe E2E Test Suite...\x1b[0m');
console.log(`\x1b[90mTarget: ${relativeScriptPath}\x1b[0m\n`);

try {
  execSync(`npx tsx ${relativeScriptPath}`, {
    cwd: rootDir,
    stdio: 'inherit',
    env: {
      ...process.env,
      FORCE_COLOR: '1',
    },
  });
  console.log('\x1b[32m✔ Test execution completed successfully with exit code 0.\x1b[0m');
  process.exit(0);
} catch (err) {
  const exitCode = (err && typeof err.status === 'number') ? err.status : 1;
  console.error(`\x1b[31m✖ Test execution failed with exit code ${exitCode}.\x1b[0m`);
  process.exit(exitCode);
}
