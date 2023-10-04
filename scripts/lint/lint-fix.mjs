import {execute} from '../exec.mjs';

async function main() {
  try {
    await execute('npx', ['eslint', '.', '--fix']);

    await execute('npx', [
      'prettier',
      '"**/*.{scss,css,pcss,html,md,**/{package,nx,project}.json}"',
      '--write',
    ]);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

main();
