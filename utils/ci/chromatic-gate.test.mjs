import assert from 'node:assert/strict';
import test from 'node:test';
import {evaluateChromaticGate} from './chromatic-gate.mjs';

const state = ({dependencies = {}, devDependencies = {}, catalog = {}, importer = {}} = {}) => ({
  manifest: {dependencies, devDependencies},
  workspace: {catalog},
  lock: {importers: {'packages/atomic': importer}},
});

const evaluate = ({changedFiles = [], base, head}) =>
  evaluateChromaticGate({changedFiles, base, head});

test('runs for Atomic source, Storybook, assets, and configuration changes', () => {
  const fixture = state();

  for (const file of [
    'packages/atomic/src/components/common/button.ts',
    'packages/atomic/.storybook/preview.ts',
    'packages/atomic/src/assets/lang/en.json',
    'packages/atomic/chromatic.config.json',
  ]) {
    assert.equal(evaluate({changedFiles: [file], base: fixture, head: fixture}).shouldRun, true);
  }
});

test('runs when a direct catalog dependency changes', () => {
  const base = state({
    devDependencies: {tailwindcss: 'catalog:'},
    catalog: {tailwindcss: '4.3.2'},
    importer: {devDependencies: {tailwindcss: {version: '4.3.2'}}},
  });
  const head = state({
    devDependencies: {tailwindcss: 'catalog:'},
    catalog: {tailwindcss: '4.3.3'},
    importer: {devDependencies: {tailwindcss: {version: '4.3.3'}}},
  });

  const result = evaluate({changedFiles: ['pnpm-workspace.yaml', 'pnpm-lock.yaml'], base, head});
  assert.equal(result.shouldRun, true);
  assert.equal(result.dependencyChanged, true);
  assert.deepEqual(result.reasons, ['tailwindcss']);
});

test('disables TurboSnap when an Atomic direct dependency declaration changes', () => {
  const base = state({
    devDependencies: {tailwindcss: '4.3.2'},
    importer: {devDependencies: {tailwindcss: {version: '4.3.2'}}},
  });
  const head = state({
    devDependencies: {tailwindcss: '4.3.3'},
    importer: {devDependencies: {tailwindcss: {version: '4.3.3'}}},
  });

  const result = evaluate({
    changedFiles: ['packages/atomic/package.json', 'pnpm-lock.yaml'],
    base,
    head,
  });
  assert.equal(result.shouldRun, true);
  assert.equal(result.dependencyChanged, true);
  assert.deepEqual(result.reasons, ['atomic-changed', 'tailwindcss']);
});

test('runs when a direct dependency lock resolution changes', () => {
  const base = state({
    dependencies: {lit: '3.3.3'},
    importer: {dependencies: {lit: {version: '3.3.3'}}},
  });
  const head = state({
    dependencies: {lit: '3.3.3'},
    importer: {dependencies: {lit: {version: '3.3.3(peer-a@1.0.0)'}}},
  });

  const result = evaluate({changedFiles: ['pnpm-lock.yaml'], base, head});
  assert.equal(result.shouldRun, true);
  assert.deepEqual(result.reasons, ['lit']);
});

test('skips unrelated catalog and lockfile changes', () => {
  const base = state({
    dependencies: {lit: 'catalog:'},
    catalog: {lit: '3.3.3', vite: '6.0.0'},
    importer: {dependencies: {lit: {version: '3.3.3'}}},
  });
  const head = state({
    dependencies: {lit: 'catalog:'},
    catalog: {lit: '3.3.3', vite: '6.1.0'},
    importer: {dependencies: {lit: {version: '3.3.3'}}},
  });

  const result = evaluate({base, head});
  assert.equal(result.shouldRun, false);
  assert.equal(result.dependencyChanged, false);
});

test('skips local workspace dependency source changes', () => {
  const fixture = state({dependencies: {'@coveo/headless': 'workspace:*'}});
  const result = evaluate({
    changedFiles: ['packages/headless/src/app/engine.ts'],
    base: fixture,
    head: fixture,
  });

  assert.equal(result.shouldRun, false);
});

test('skips unrelated source changes', () => {
  const fixture = state();
  const result = evaluate({
    changedFiles: ['packages/headless/src/app/engine.ts'],
    base: fixture,
    head: fixture,
  });

  assert.equal(result.shouldRun, false);
  assert.equal(result.dependencyChanged, false);
});

test('fails closed for missing direct dependency resolutions', () => {
  const invalid = state({dependencies: {lit: '3.3.3'}});
  const result = evaluate({changedFiles: ['pnpm-lock.yaml'], base: invalid, head: invalid});

  assert.equal(result.shouldRun, true);
  assert.equal(result.dependencyChanged, true);
  assert.match(result.reasons[0], /^invalid-dependency-state:/);
});
