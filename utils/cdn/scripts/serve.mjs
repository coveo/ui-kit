import {spawn} from 'node:child_process';
import chalk from 'chalk';

try {
  console.log(
    // eslint-disable-next-line @cspell/spellchecker
    chalk.cyan(
      'Starting workspace server on port 3000 for ./dist/proda/StaticCDN directory...'
    )
  );
  // eslint-disable-next-line @cspell/spellchecker
  spawn('npx', ['ws', '--port', '3000', '-d', 'dist/proda/StaticCDN'], {
    stdio: 'inherit',
  });
} catch (err) {
  console.error(chalk.red('Error starting the server:'), err);
  process.exit(1);
}
