#!/usr/bin/env node
// Builds the ./publish directory that pnpm publishes for this sample (referenced
// by `publishConfig.directory`). Samples ship as `@coveo/create-ui` scaffolding
// templates: the published copy must stay buildable after scaffolding (so it
// keeps build tooling like vite) but must NOT carry internal, unpublished
// workspace packages such as `@coveo/platform-mock-api` — those are only needed
// for the in-repo Playwright smoke test and would break `install` for a
// scaffolded project.
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';

const OUT_DIR = 'publish';

// Files that make up the runnable, scaffoldable app.
const SHIPPED_PATHS = [
  'src',
  'public',
  'index.html',
  'vite.config.js',
  'tsconfig.json',
  'README.md',
];

// Test-only tooling that must not reach a scaffolded project. Build tooling
// (vite, @vitejs/plugin-react, vite-plugin-static-copy) is intentionally kept.
const TEST_ONLY_DEV_DEPENDENCIES = [
  '@coveo/platform-mock-api',
  '@msw/playwright',
  '@playwright/test',
  'msw',
];
const TEST_ONLY_SCRIPTS = ['e2e'];

const isTestFile = (path) => /\.(test|spec)\.[jt]sx?$/.test(path);

rmSync(OUT_DIR, {recursive: true, force: true});
mkdirSync(OUT_DIR, {recursive: true});
for (const path of SHIPPED_PATHS) {
  if (!existsSync(path)) {
    continue;
  }
  cpSync(path, `${OUT_DIR}/${path}`, {
    recursive: true,
    filter: (source) => !isTestFile(source),
  });
}

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
for (const dependency of TEST_ONLY_DEV_DEPENDENCIES) {
  delete pkg.devDependencies?.[dependency];
}
for (const script of TEST_ONLY_SCRIPTS) {
  delete pkg.scripts?.[script];
}
// The published copy is the final artifact: it should not re-run the builder or
// point at a nested publish directory.
delete pkg.scripts?.prepack;
delete pkg.publishConfig?.directory;
delete pkg.publishConfig?.linkDirectory;

writeFileSync(`${OUT_DIR}/package.json`, `${JSON.stringify(pkg, null, 2)}\n`);
