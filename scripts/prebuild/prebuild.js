#!/usr/bin/env node
/**
 * MedSIS Prebuild Scripts
 * Category: Prebuild
 * Usage: node scripts/prebuild/prebuild.js [platform]
 * Platforms: android, ios, all
 */

const { execSync } = require('child_process');

const platform = process.argv[2] || 'all';

const commands = {
  android: [
    'echo "🧹 Cleaning android directory..."',
    'rm -rf android',
    'echo "🔨 Prebuilding Android..."',
    'npx expo prebuild --platform android',
  ],
  ios: [
    'echo "🧹 Cleaning ios directory..."',
    'rm -rf ios',
    'echo "🔨 Prebuilding iOS..."',
    'npx expo prebuild --platform ios',
  ],
  all: [
    'echo "🧹 Cleaning android and ios directories..."',
    'rm -rf android ios',
    'echo "🔨 Prebuilding all platforms..."',
    'npx expo prebuild',
  ],
};

const steps = commands[platform];
if (!steps) {
  console.error(`❌ Unknown platform: "${platform}". Use: android, ios, or all`);
  process.exit(1);
}

console.log(`\n⚙️  [MedSIS Prebuild] Platform: ${platform}\n`);
steps.forEach(cmd => {
  console.log(`  ▶ ${cmd}`);
  execSync(cmd, { stdio: 'inherit', shell: true });
});
console.log('\n✅ Prebuild complete!\n');
