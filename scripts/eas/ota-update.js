#!/usr/bin/env node
/**
 * MedSIS EAS OTA Update Script
 * Category: EAS Cloud
 * Usage: node scripts/eas/ota-update.js [branch] [message]
 * Default branch: production
 */

const { execSync } = require('child_process');

const branch  = process.argv[2] || 'production';
const message = process.argv.slice(3).join(' ') || 'OTA Update';

const cmd = `eas update --branch ${branch} --message "${message}"`;

console.log(`\n📡 [MedSIS OTA Update]`);
console.log(`   Branch  : ${branch}`);
console.log(`   Message : ${message}`);
console.log(`   Command : ${cmd}\n`);

execSync(cmd, { stdio: 'inherit', shell: true });
console.log('\n✅ OTA Update published!\n');
