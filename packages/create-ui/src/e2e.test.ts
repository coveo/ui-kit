/**
 * End-to-end smoke test: runs the full create-ui scaffold pipeline
 * (download from npm -> rewrite package.json -> install -> build).
 *
 * Install- and build-heavy, so it is excluded from the default unit run:
 *
 *   E2E=1 pnpm --filter @coveo/create-ui test
 */

import {access, mkdtemp, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {afterAll, beforeAll, describe, expect, it} from 'vitest';
import {scaffold} from './index.js';
import {getTemplate} from './templates.js';

const RUN_E2E = Boolean(process.env.E2E);

describe.skipIf(!RUN_E2E)('create-ui e2e', () => {
  let workDir: string;

  beforeAll(async () => {
    workDir = await mkdtemp(join(tmpdir(), 'create-ui-e2e-'));
  });

  afterAll(async () => {
    await rm(workDir, {recursive: true, force: true});
  });

  it('scaffolds, installs, and builds headless-search-react', async () => {
    const template = getTemplate('headless-search-react')!;
    const projectName = 'my-app';
    const targetDir = join(workDir, projectName);

    // Change cwd temporarily so scaffold resolves the target relative to workDir.
    const originalCwd = process.cwd();
    process.chdir(workDir);
    try {
      await scaffold(template, projectName);
    } finally {
      process.chdir(originalCwd);
    }

    // Verify the project was created and can build.
    await expect(
      access(join(targetDir, 'package.json'))
    ).resolves.toBeUndefined();

    const build = spawnSync('npm', ['run', 'build'], {
      cwd: targetDir,
      stdio: 'inherit',
      shell: process.platform === 'win32',
    });
    expect(build.status).toBe(0);
  }, 300_000);
});
