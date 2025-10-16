import {spawn} from 'node:child_process';
import colors from '../../ci/colors.mjs';

try {
  console.log(
    // eslint-disable-next-line @cspell/spellchecker
    colors.cyan(
      'Starting workspace server on port 3000 for ./dist/proda/StaticCDN directory...'
    )
  );
  // eslint-disable-next-line @cspell/spellchecker
  spawn(
    'pnpm',
    ['exec', 'ws', '--port', '3000', '-d', 'dist/proda/StaticCDN'],
    {
      stdio: 'inherit',
    }
  );
} catch (err) {
  console.error(colors.red('Error starting the server:'), err);
  process.exit(1);
}
