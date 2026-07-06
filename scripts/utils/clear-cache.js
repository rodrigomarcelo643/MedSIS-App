#!/usr/bin/env node
/**
 * MedSIS Cache Clear Script
 * Category: Utilities
 * Usage: node scripts/utils/clear-cache.js
 * Clears Metro bundler cache, Expo cache, and optionally node_modules
 */

const { execSync } = require('child_process');
const fs   = require('fs');
const path = require('path');

const args       = process.argv.slice(2);
const deepClean  = args.includes('--deep');
const rootDir    = path.join(__dirname, '../..');

const steps = [
  { name: 'Expo Metro cache', cmd: 'npx expo start --clear --non-interactive &', skip: false },
  { name: '.expo folder', fn: () => fs.rmSync(path.join(rootDir, '.expo'), { recursive: true, force: true }) },
  { name: 'Android build cache', fn: () => {
    const dir = path.join(rootDir, 'android', 'build');
    fs.rmSync(dir, { recursive: true, force: true });
  }},
  { name: 'iOS build cache', fn: () => {
    const dir = path.join(rootDir, 'ios', 'build');
    fs.rmSync(dir, { recursive: true, force: true });
  }},
];

if (deepClean) {
  steps.push({
    name: 'node_modules (deep clean)',
    fn: () => {
      fs.rmSync(path.join(rootDir, 'node_modules'), { recursive: true, force: true });
      console.log('  ℹ️  Run "npm install" to restore dependencies.');
    }
  });
}

console.log(`\n🧹 [MedSIS Cache Clear]${deepClean ? ' (deep mode)' : ''}\n`);

steps.forEach(({ name, cmd, fn, skip }) => {
  if (skip) return;
  console.log(`  ▶ Clearing: ${name}`);
  try {
    if (fn) fn();
    else if (cmd) execSync(cmd, { shell: true, timeout: 3000 });
    console.log(`  ✅ ${name} cleared`);
  } catch {
    console.log(`  ⚠️  ${name} skipped (may not exist)`);
  }
});

console.log('\n✅ Cache cleared! Restart the app with: npm start\n');
