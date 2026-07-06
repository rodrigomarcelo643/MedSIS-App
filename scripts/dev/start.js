#!/usr/bin/env node
/**
 * MedSIS Dev Scripts
 * Category: Development
 * Usage: node scripts/dev/start.js [option]
 * Options: --clear, --tunnel
 */

const { execSync } = require('child_process');

const args = process.argv.slice(2);
const flag = args[0] || '';

const commands = {
  '--clear': 'expo start --clear',
  '--tunnel': 'expo start --tunnel',
  '--android': 'expo run:android',
  '--ios': 'expo run:ios',
  '--web': 'expo start --web',
};

const cmd = commands[flag] || 'expo start';
console.log(`\n🚀 [MedSIS Dev] Running: ${cmd}\n`);
execSync(cmd, { stdio: 'inherit' });
