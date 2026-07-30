#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const ADR_FILENAME_RE = /^\d{4}-.*\.md$/;

const adrDir = process.argv[2];

if (!adrDir) {
  console.error('Usage: node next-adr-number.mjs <path-to-adr-directory>');
  process.exit(1);
}

const resolved = path.resolve(adrDir);

let entries;
try {
  const stat = fs.statSync(resolved);
  if (!stat.isDirectory()) {
    throw new Error('Not a directory');
  }
  entries = fs.readdirSync(resolved);
} catch {
  console.error(`ADR directory not found or unreadable: ${resolved}`);
  process.exit(1);
}

let max = 0;
for (const entry of entries) {
  if (ADR_FILENAME_RE.test(entry)) {
    const num = parseInt(entry.slice(0, 4), 10);
    if (num > max) {
      max = num;
    }
  }
}

const next = max + 1;
console.log(String(next).padStart(4, '0'));
