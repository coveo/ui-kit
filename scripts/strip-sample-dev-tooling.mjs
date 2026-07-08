#!/usr/bin/env node
// Strips test-only tooling from a sample's package.json when packing/publishing
// it to npm, then restores the source afterwards. Samples ship as scaffolding
// templates consumed by `@coveo/create-ui`; their in-repo smoke tests depend on
// internal, unpublished workspace packages (e.g. `@coveo/platform-mock-api`),
// which would break `install` for a scaffolded project. Keeping those out of the
// published package.json avoids that while leaving the repo copy intact for CI.
//
// Usage (run from a sample package directory, via its prepack/postpack hooks):
//   node <path>/strip-sample-dev-tooling.mjs strip
//   node <path>/strip-sample-dev-tooling.mjs restore
import {
  copyFileSync,
  existsSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';

const TEST_ONLY_DEV_DEPENDENCIES = [
  '@coveo/platform-mock-api',
  '@msw/playwright',
  '@playwright/test',
  '@testing-library/jest-dom',
  '@testing-library/react',
  'msw',
  'vitest',
];

const TEST_ONLY_SCRIPTS = ['test', 'e2e'];

const PKG_PATH = 'package.json';
const BACKUP_PATH = 'package.json.prepack-backup';

function strip() {
  copyFileSync(PKG_PATH, BACKUP_PATH);
  const pkg = JSON.parse(readFileSync(PKG_PATH, 'utf8'));

  for (const dependency of TEST_ONLY_DEV_DEPENDENCIES) {
    delete pkg.devDependencies?.[dependency];
  }
  for (const script of TEST_ONLY_SCRIPTS) {
    delete pkg.scripts?.[script];
  }

  writeFileSync(PKG_PATH, `${JSON.stringify(pkg, null, 2)}\n`);
}

function restore() {
  if (existsSync(BACKUP_PATH)) {
    copyFileSync(BACKUP_PATH, PKG_PATH);
    rmSync(BACKUP_PATH);
  }
}

const mode = process.argv[2];
if (mode === 'strip') {
  strip();
} else if (mode === 'restore') {
  restore();
} else {
  console.error('Usage: strip-sample-dev-tooling.mjs <strip|restore>');
  process.exit(1);
}
