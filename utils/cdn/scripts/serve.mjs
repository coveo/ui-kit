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
  const child = spawn(
    'pnpm',
    [
      '--filter',
      '@coveo/cdn',
      'exec',
      '--',
      'ws',
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

  const handleSignal = (signal) => {
    if (child.exitCode !== null || child.signalCode !== null) {
      process.exit(0);
      return;
    }

    child.kill(signal);

    setTimeout(() => {
      if (child.exitCode === null && child.signalCode === null) {
        child.kill('SIGKILL');
      }
    }, 400);
  };

  ['SIGINT', 'SIGTERM'].forEach((signal) => {
    process.on(signal, () => handleSignal(signal));
  });

  child.on('exit', (code, signal) => {
    if (signal) {
      process.exit(0);
    }
    process.exit(code ?? 0);
  });

  child.on('error', (err) => {
    console.error(colors.red('Error starting the server:'), err);
    process.exit(1);
  });
} catch (err) {
  console.error(colors.red('Error starting the server:'), err);
  process.exit(1);
}
