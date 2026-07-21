import {execFileSync} from 'node:child_process';
import {mkdir, mkdtemp, readdir, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const packageDir = dirname(dirname(fileURLToPath(import.meta.url)));
const tempDir = await mkdtemp(join(tmpdir(), 'create-ui-pack-'));
const installDir = join(tempDir, 'install');

await mkdir(installDir);

try {
  execFileSync('pnpm', ['pack', '--pack-destination', tempDir], {
    cwd: packageDir,
    stdio: 'inherit',
  });

  const packageFile = (await readdir(tempDir)).find((file) =>
    file.endsWith('.tgz')
  );
  if (packageFile === undefined) {
    throw new Error('pnpm pack did not produce a package tarball.');
  }

  execFileSync(
    'npm',
    [
      'install',
      '--ignore-scripts',
      '--no-package-lock',
      join(tempDir, packageFile),
    ],
    {cwd: installDir, stdio: 'inherit'}
  );
  execFileSync('npm', ['exec', '--no', '--', 'create-ui', '--help'], {
    cwd: installDir,
    stdio: 'inherit',
  });
} finally {
  await rm(tempDir, {recursive: true, force: true});
}
