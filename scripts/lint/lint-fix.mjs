import {execute} from '../exec.mjs';

async function main() {
  try {
    await execute('npx', ['eslint', '.', '--fix']);

    await execute('npx', [
      'prettier',
      '"**/*.{scss,css,pcss,html,md,ts,tsx,js,mjs,**/{package,nx,project}.json}"',
      '--write',
    ]);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

main();
