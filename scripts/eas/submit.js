#!/usr/bin/env node
/**
 * MedSIS EAS Submit Script
 * Category: EAS Cloud
 * Usage: node scripts/eas/submit.js [platform]
 * Platforms: android, ios
 * Requires: EAS credentials configured via `eas credentials`
 */

const { execSync } = require('child_process');

const platform = process.argv[2] || 'android';

const validPlatforms = ['android', 'ios'];
if (!validPlatforms.includes(platform)) {
  console.error(`❌ Unknown platform: "${platform}". Use: android or ios`);
  process.exit(1);
}

const cmd = `eas submit --platform ${platform}`;

console.log(`\n🚀 [MedSIS Store Submit]`);
console.log(`   Platform : ${platform}`);
console.log(`   Command  : ${cmd}`);
console.log(`\n⚠️  Make sure EAS credentials are configured: run 'eas credentials' first.\n`);

execSync(cmd, { stdio: 'inherit', shell: true });
console.log('\n✅ Submission complete!\n');
