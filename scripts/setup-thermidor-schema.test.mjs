import assert from 'node:assert/strict';
import {mkdir, mkdtemp, readFile, rm, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import test from 'node:test';

import {ensureThermidorSchema, THERMIDOR_SCHEMA_NPM_FALLBACK} from './setup-thermidor-schema.mjs';

async function createRepositoryFixture() {
  return mkdtemp(join(tmpdir(), 'ui-kit-schema-setup-test-'));
}

test('keeps the npm fallback disabled by default', async () => {
  const repoRoot = await createRepositoryFixture();
  const commands = [];

  try {
    await assert.rejects(
      ensureThermidorSchema({
        repoRoot,
        run: async (command, args) => {
          commands.push([command, ...args]);
          throw new Error('submodule unavailable');
        },
      }),
      /npm fallback is disabled/
    );

    assert.deepEqual(commands, [
      ['git', 'submodule', 'update', '--init', 'packages/thermidor-schema'],
    ]);
    assert.equal(THERMIDOR_SCHEMA_NPM_FALLBACK.enabled, false);
    assert.equal(THERMIDOR_SCHEMA_NPM_FALLBACK.packageSpec, '@coveo/thermidor-schema@0.1.0');
  } finally {
    await rm(repoRoot, {force: true, recursive: true});
  }
});

test('materializes the pinned npm package at the workspace path when enabled', async () => {
  const repoRoot = await createRepositoryFixture();
  const commands = [];

  try {
    const source = await ensureThermidorSchema({
      fallback: {
        enabled: true,
        packageSpec: '@coveo/thermidor-schema@0.1.0',
      },
      repoRoot,
      run: async (command, args) => {
        commands.push([command, ...args]);
        if (command === 'git') {
          throw new Error('submodule unavailable');
        }

        const prefix = args[args.indexOf('--prefix') + 1];
        const packageRoot = join(prefix, 'node_modules', '@coveo', 'thermidor-schema');
        await mkdir(join(packageRoot, 'dist'), {recursive: true});
        await mkdir(join(packageRoot, 'schema'), {recursive: true});
        await writeFile(
          join(packageRoot, 'package.json'),
          `${JSON.stringify({
            name: '@coveo/thermidor-schema',
            version: '0.1.0',
            scripts: {build: 'must not run for the packed fallback'},
          })}\n`
        );
        await writeFile(join(packageRoot, 'dist', 'index.js'), 'export {};\n');
        await writeFile(join(packageRoot, 'dist', 'index.d.ts'), 'export {};\n');
      },
    });

    assert.equal(source, 'npm');
    assert.equal(commands[1][0], 'npm');
    assert.ok(commands[1].includes('@coveo/thermidor-schema@0.1.0'));

    const materializedManifest = JSON.parse(
      await readFile(
        join(repoRoot, 'packages', 'thermidor-schema', 'packages', 'typescript', 'package.json'),
        'utf8'
      )
    );
    assert.equal(materializedManifest.name, '@coveo/thermidor-schema');
    assert.equal(materializedManifest.version, '0.1.0');
    assert.equal(materializedManifest.scripts, undefined);
  } finally {
    await rm(repoRoot, {force: true, recursive: true});
  }
});
