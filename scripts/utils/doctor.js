#!/usr/bin/env node
/**
 * MedSIS Expo Doctor Script
 * Category: Utilities
 * Usage: node scripts/utils/doctor.js
 * Runs Expo's built-in project health checker.
 */

const { execSync } = require('child_process');

console.log('\n🩺 [MedSIS Project Doctor]\n');

try {
  execSync('npx expo-doctor', { stdio: 'inherit', shell: true });
  console.log('\n✅ Project health check complete!\n');
} catch {
  console.error('\n⚠️  Issues found. Review the output above.\n');
  process.exit(1);
}
