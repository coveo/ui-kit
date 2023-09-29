import {execute} from '../exec.mjs';

async function main() {
  try {
    await execute('npx', ['eslint', '.']);

    await execute('npx', [
      'cspell',
      '--no-progress',
      '"**/*.md"',
      '--no-must-find-files',
    ]);

    await execute('npx', ['prettier', '--check', '.']);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

main();
