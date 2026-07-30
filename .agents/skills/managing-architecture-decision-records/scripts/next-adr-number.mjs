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
  entries = fs.readdirSync(resolved);
} catch {
  entries = [];
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
