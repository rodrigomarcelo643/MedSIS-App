#!/usr/bin/env node
/**
 * MedSIS Local Build Scripts
 * Category: Build (Local)
 * Usage: node scripts/build/local-build.js [target]
 * Targets: apk, aab, android, ios
 */

const { execSync } = require('child_process');

const target = process.argv[2] || 'apk';

const tasks = {
  apk: {
    label: 'Android APK (assembleRelease)',
    steps: [
      'rm -rf android',
      'npx expo prebuild --platform android',
      'chmod +x android/gradlew',
      'cd android && ./gradlew assembleRelease --no-daemon',
    ],
    output: 'android/app/build/outputs/apk/release/app-release.apk',
  },
  aab: {
    label: 'Android AAB (bundleRelease) — for Google Play',
    steps: [
      'rm -rf android',
      'npx expo prebuild --platform android',
      'chmod +x android/gradlew',
      'cd android && ./gradlew bundleRelease --no-daemon',
    ],
    output: 'android/app/build/outputs/bundle/release/app-release.aab',
  },
  android: {
    label: 'Android (EAS Local)',
    steps: [
      'rm -rf android',
      'npx expo prebuild --platform android',
      'eas build --platform android --local',
    ],
    output: '*.apk (in project root)',
  },
  ios: {
    label: 'iOS Simulator (EAS Local)',
    steps: [
      'rm -rf ios',
      'npx expo prebuild --platform ios',
      'eas build --platform ios --local',
    ],
    output: '*.tar.gz (in project root)',
  },
};

const task = tasks[target];
if (!task) {
  console.error(`❌ Unknown target: "${target}". Use: apk, aab, android, ios`);
  process.exit(1);
}

console.log(`\n🏗️  [MedSIS Local Build] ${task.label}\n`);
task.steps.forEach(cmd => {
  console.log(`  ▶ ${cmd}`);
  execSync(cmd, { stdio: 'inherit', shell: true });
});
console.log(`\n✅ Build complete! Output: ${task.output}\n`);
