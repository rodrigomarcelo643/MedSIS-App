#!/usr/bin/env node
/**
 * MedSIS Dependency Check Script
 * Category: Utilities
 * Usage: node scripts/utils/check-deps.js [--upgrade]
 * Checks for outdated packages using npm-check-updates.
 * Pass --upgrade to auto-upgrade package.json.
 */

const { execSync } = require('child_process');

const upgrade = process.argv.includes('--upgrade');

console.log(`\n📦 [MedSIS Dependency Checker]${upgrade ? ' (upgrade mode)' : ''}\n`);

const cmd = upgrade
  ? 'npx npm-check-updates -u && npm install'
  : 'npx npm-check-updates';

try {
  execSync(cmd, { stdio: 'inherit', shell: true });
  if (upgrade) {
    console.log('\n✅ Dependencies upgraded and installed!\n');
  } else {
    console.log('\nℹ️  Run with --upgrade flag to apply updates.\n');
  }
} catch {
  console.error('\n❌ Dependency check failed.\n');
  process.exit(1);
}
