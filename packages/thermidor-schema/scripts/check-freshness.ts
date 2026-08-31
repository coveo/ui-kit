import {execFileSync} from 'node:child_process';
import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const target = process.argv[2];

if (!target || !['src', 'dist'].includes(target)) {
  console.error('Usage: check-freshness.ts <src|dist>');
  process.exit(2);
}

if (target === 'src') {
  // Delegates to generate-zod.ts --check which compares generated output
  try {
    execFileSync(
      'node',
      ['--experimental-strip-types', resolve(packageRoot, 'scripts/generate-zod.ts'), '--check'],
      {
        cwd: packageRoot,
        stdio: 'inherit',
      }
    );
  } catch {
    process.exit(1);
  }
} else {
  // dist freshness: verify that running tsc produces the same output
  // This is validated via the test suite rather than a standalone script
  console.log('dist freshness validation is handled by the test suite.');
}
