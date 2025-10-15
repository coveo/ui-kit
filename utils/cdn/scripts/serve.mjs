import {spawn} from 'node:child_process';
import path from 'node:path';
import colors from '../../ci/colors.mjs';

try {
  console.log(
    // eslint-disable-next-line @cspell/spellchecker
    colors.cyan(
      'Starting workspace server on port 3000 for ./dist/proda/StaticCDN directory...'
    )
  );
  spawn(
    'pnpm',
    [
      '--filter',
      '@coveo/cdn',
      'exec',
      '--',
      'local-web-server',
      '--port',
      '3000',
      '-d',
      'dist/proda/StaticCDN',
    ],
    {
      stdio: 'inherit',
      cwd: path.resolve(import.meta.dirname, '..'),
    }
  );
} catch (err) {
  console.error(colors.red('Error starting the server:'), err);
  process.exit(1);
}
