#!/usr/bin/env node
/**
 * Remove build artifacts, test output, and generated files.
 * Run: npm run clean
 * Safe: game will still run. These are all outputs/artifacts.
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

const folders = [
  'dist',
  'dist-app',
  'build-output',
  'dist-electron',
  'final-build',
  'out',
  'release',
  'release-build',
  'test-results',
  'playwright-report',
  'debug-logs',
  '.parcel-cache',
  '.cache',
];

const files = [
  'boon-export.json',
  'boon-export2.json',
  'SESSION_STATE.json',
  'SAVE_CONFIRMATION.txt',
];

let removed = 0;

for (const name of folders) {
  const dir = path.join(root, name);
  if (fs.existsSync(dir)) {
    try {
      fs.rmSync(dir, { recursive: true });
      console.log(`Removed ${name}/`);
      removed++;
    } catch (e) {
      console.error(`Failed to remove ${name}/:`, e.message);
    }
  }
}

for (const name of files) {
  const file = path.join(root, name);
  if (fs.existsSync(file)) {
    try {
      fs.unlinkSync(file);
      console.log(`Removed ${name}`);
      removed++;
    } catch (e) {
      console.error(`Failed to remove ${name}:`, e.message);
    }
  }
}

// tools/exports/*.json (boon exports)
const exportsDir = path.join(root, 'tools', 'exports');
if (fs.existsSync(exportsDir)) {
  const entries = fs.readdirSync(exportsDir, { withFileTypes: true });
  for (const e of entries) {
    if (e.isFile() && e.name.endsWith('.json')) {
      try {
        fs.unlinkSync(path.join(exportsDir, e.name));
        console.log(`Removed tools/exports/${e.name}`);
        removed++;
      } catch (err) {
        console.error(`Failed to remove tools/exports/${e.name}:`, err.message);
      }
    }
  }
}

console.log(removed > 0 ? `Cleaned ${removed} item(s).` : 'Nothing to clean.');
