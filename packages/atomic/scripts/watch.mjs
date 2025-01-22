import {execSync} from 'node:child_process';
import {watch} from 'node:fs';

function rebuild() {
  const commands = [
    'node --max_old_space_size=6144 ../../node_modules/@stencil/core/bin/stencil build',
    'node ./scripts/stencil-proxy.mjs',
    'tsc -p tsconfig.lit.json',
    'node process-css.mjs --config=tsconfig.lit.json ',
    'esbuild src/autoloader/index.ts --format=esm --outfile=dist/atomic/autoloader/index.esm.js',
    'esbuild src/autoloader/index.ts --format=cjs --outfile=dist/atomic/autoloader/index.cjs.js',
  ];
  for (const command of commands) {
    execSync(command, {
      stdio: 'inherit',
      env: {...process.env, IS_DEV: 'true'},
    });
  }
}

watch('src', {recursive: true}, rebuild);
rebuild();
