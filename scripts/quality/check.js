#!/usr/bin/env node
/**
 * MedSIS Code Quality Check Script
 * Category: Quality
 * Usage: node scripts/quality/check.js [--fix]
 * Runs: ESLint + TypeScript type check
 */

const { execSync } = require('child_process');

const fix = process.argv.includes('--fix');

const steps = [
  {
    name: 'ESLint',
    cmd: fix ? 'expo lint --fix' : 'expo lint',
  },
  {
    name: 'TypeScript Type Check',
    cmd: 'tsc --noEmit',
  },
];

console.log(`\n🔍 [MedSIS Quality Check]${fix ? ' (auto-fix enabled)' : ''}\n`);

let hasError = false;

steps.forEach(({ name, cmd }) => {
  console.log(`  ▶ ${name}: ${cmd}`);
  try {
    execSync(cmd, { stdio: 'inherit', shell: true });
    console.log(`  ✅ ${name} passed\n`);
  } catch {
    console.error(`  ❌ ${name} failed\n`);
    hasError = true;
  }
});

if (hasError) {
  console.error('⚠️  Some quality checks failed. Please fix the issues above.\n');
  process.exit(1);
} else {
  console.log('✅ All quality checks passed!\n');
}
