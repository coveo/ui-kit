import {execute} from '../exec.mjs';

async function main() {
  try {
    await execute('npx', ['eslint', '.', '--fix']);

    await execute('npx', [
      'cspell',
      '--no-progress',
      '"**/*.md"',
      '--no-must-find-files',
      '--write',
    ]);

    await execute('npx', ['prettier', '--write', '.']);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

main();
