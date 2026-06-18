/**
 * End-to-end smoke test: packages the LOCAL repo's sample into a tarball (the
 * same shape GitHub serves), runs the full create-ui pipeline
 * (extract -> resolve -> finalize -> install), and builds the result.
 *
 * Using a local tarball keeps the test deterministic and offline — it validates
 * the current working tree's samples rather than whatever is on `main`.
 *
 * Install- and build-heavy, so it is excluded from the default unit run:
 *
 *   E2E=1 pnpm --filter @coveo/create-ui test
 */

import {createReadStream} from 'node:fs';
import {access, cp, mkdir, mkdtemp, readdir, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join, resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
import {afterAll, beforeAll, describe, expect, it} from 'vitest';
import {create} from 'tar';
import {extractSampleFromTarball} from './download.js';
import {resolveSampleDependencies} from './resolve-deps.js';
import {finalizeProject, installDependencies} from './setup.js';
import {getTemplate} from './templates.js';

const RUN_E2E = Boolean(process.env.E2E);
const REPO_ROOT = resolve(process.cwd(), '../..');
const ROOT = 'ui-kit-e2e';

/** Builds a GitHub-shaped tarball containing only what scaffolding needs. */
async function buildLocalTarball(
  samplePath: string,
  workDir: string
): Promise<string> {
  const stage = join(workDir, 'stage');
  const rootDir = join(stage, ROOT);

  await cp(join(REPO_ROOT, samplePath), join(rootDir, samplePath), {
    recursive: true,
  });
  await cp(
    join(REPO_ROOT, 'pnpm-workspace.yaml'),
    join(rootDir, 'pnpm-workspace.yaml')
  );

  // Copy each packages/<name>/package.json for workspace: resolution.
  const packagesDir = join(REPO_ROOT, 'packages');
  for (const dir of await readdir(packagesDir)) {
    const src = join(packagesDir, dir, 'package.json');
    try {
      await access(src);
    } catch {
      continue;
    }
    await mkdir(join(rootDir, 'packages', dir), {recursive: true});
    await cp(src, join(rootDir, 'packages', dir, 'package.json'));
  }

  const tarball = join(workDir, 'local.tar.gz');
  await create({gzip: true, cwd: stage, file: tarball}, [ROOT]);
  return tarball;
}

describe.skipIf(!RUN_E2E)('create-ui e2e (local tarball)', () => {
  let workDir: string;

  beforeAll(async () => {
    workDir = await mkdtemp(join(tmpdir(), 'create-ui-e2e-'));
  });

  afterAll(async () => {
    await rm(workDir, {recursive: true, force: true});
  });

  it('scaffolds, installs, and builds headless-search-react', async () => {
    const template = getTemplate('headless-search-react')!;
    const tarball = await buildLocalTarball(template.path, workDir);

    const treeRoot = join(workDir, 'tree');
    const sampleDir = await extractSampleFromTarball(
      createReadStream(tarball),
      {samplePath: template.path, destDir: treeRoot}
    );
    await resolveSampleDependencies({sampleDir, treeRoot});

    const targetDir = join(workDir, 'my-app');
    await finalizeProject({sampleDir, targetDir, projectName: 'my-app'});

    expect(installDependencies(targetDir, 'npm')).toBe(true);

    const build = spawnSync('npm', ['run', 'build'], {
      cwd: targetDir,
      stdio: 'inherit',
      shell: process.platform === 'win32',
    });
    expect(build.status).toBe(0);
    await expect(access(join(targetDir, 'dist'))).resolves.toBeUndefined();
  }, 300_000);
});
