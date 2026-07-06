#!/usr/bin/env node
/**
 * MedSIS Unused Assets Audit Script
 * Category: Quality
 * Usage: node scripts/quality/audit-assets.js
 * Scans assets/ and checks if each file is referenced in source code.
 */

const fs   = require('fs');
const path = require('path');

const assetsDir  = path.join(__dirname, '../../assets');
const srcDirs    = ['app', 'components', 'contexts', 'hooks', 'redux', 'services', 'constants'];
const configFiles = ['app.json', 'package.json'];
const rootDir    = path.join(__dirname, '../..');

// Recursively get all files in a directory
function getFiles(dir, exts) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  for (const file of fs.readdirSync(dir)) {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) {
      results = results.concat(getFiles(full, exts));
    } else if (!exts || exts.includes(path.extname(file))) {
      results.push(full);
    }
  }
  return results;
}

// Read all source file contents
let combined = '';
srcDirs.forEach(d => {
  getFiles(path.join(rootDir, d), ['.ts', '.tsx', '.js', '.jsx', '.json'])
    .forEach(f => { try { combined += fs.readFileSync(f, 'utf8') + '\n'; } catch {} });
});
configFiles.forEach(f => {
  const full = path.join(rootDir, f);
  if (fs.existsSync(full)) { try { combined += fs.readFileSync(full, 'utf8') + '\n'; } catch {} }
});

// Check each asset
const assetFiles = getFiles(assetsDir);
const systemAssets = ['icon', 'splash', 'favicon', 'swu_header', 'notification_sound'];

const unused = [];
const used   = [];

assetFiles.forEach(asset => {
  const name = path.basename(asset);
  const rel  = path.relative(rootDir, asset).replace(/\\/g, '/');

  if (systemAssets.some(s => name.includes(s))) {
    used.push({ name, status: '⚙️  system/expo asset' });
    return;
  }

  if (combined.includes(name) || combined.includes(rel)) {
    used.push({ name, status: '✅ referenced' });
  } else {
    unused.push(rel);
  }
});

console.log('\n📦 [MedSIS Assets Audit]\n');
console.log(`  Total assets scanned : ${assetFiles.length}`);
console.log(`  Used / System        : ${used.length}`);
console.log(`  Potentially unused   : ${unused.length}\n`);

if (unused.length > 0) {
  console.log('⚠️  Potentially unused assets (safe to review and delete):');
  unused.forEach(f => console.log(`  - ${f}`));
} else {
  console.log('✅ All assets are actively referenced in the codebase!');
}
console.log('');
