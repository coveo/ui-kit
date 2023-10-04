import {execute} from '../exec.mjs';

async function main() {
  try {
    await execute('npx', ['eslint', '.']);

    await execute('npx', [
      'cspell',
      '**/*.md',
      '--no-progress',
      '--show-suggestions',
      '--show-context',
    ]);

    await execute('npx', [
      'prettier',
      '"**/*.{scss,css,pcss,html,md,ts,tsx,js,mjs,**/{package,nx,project}.json}"',
      '--check',
    ]);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

main();
