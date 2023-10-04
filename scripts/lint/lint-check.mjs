import {execute} from '../exec.mjs';

async function main() {
  try {
    await execute('npx', ['eslint', '"**/*.{ts?(x),?(m)js}"']);

    await execute('npx', [
      'cspell',
      '--no-progress',
      '--no-must-find-files',
      '"**/*.md"',
    ]);

    await execute('npx', [
      'prettier',
      '--check',
      '"**/*.{scss,css,pcss,html,md,**/{package,nx,project}.json}"',
    ]);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

main();
