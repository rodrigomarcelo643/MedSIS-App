#!/usr/bin/env node
/**
 * MedSIS EAS Cloud Build Scripts
 * Category: EAS Cloud
 * Usage: node scripts/eas/cloud-build.js [platform] [profile]
 * Platforms: android, ios, all
 * Profiles: development, preview, production
 */

const { execSync } = require('child_process');

const platform = process.argv[2] || 'android';
const profile  = process.argv[3] || 'production';

const validPlatforms = ['android', 'ios', 'all'];
const validProfiles  = ['development', 'preview', 'production', 'ci'];

if (!validPlatforms.includes(platform)) {
  console.error(`❌ Unknown platform: "${platform}". Use: android, ios, all`);
  process.exit(1);
}
if (!validProfiles.includes(profile)) {
  console.error(`❌ Unknown profile: "${profile}". Use: development, preview, production, ci`);
  process.exit(1);
}

const cmd = `eas build --platform ${platform} --profile ${profile} --non-interactive --no-wait`;

console.log(`\n☁️  [MedSIS EAS Cloud Build]`);
console.log(`   Platform : ${platform}`);
console.log(`   Profile  : ${profile}`);
console.log(`   Command  : ${cmd}\n`);

execSync(cmd, { stdio: 'inherit', shell: true });
console.log('\n✅ EAS build submitted! Check status on https://expo.dev\n');
