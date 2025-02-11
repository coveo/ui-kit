import {execSync} from 'node:child_process';
import {watch} from 'node:fs';

function initialBuild() {
  const commands = [
    'node --max_old_space_size=6144 ../../node_modules/@stencil/core/bin/stencil build --tsConfig tsconfig.stencil.json',
    'node ./scripts/stencil-proxy.mjs',
    'node ./scripts/build.mjs --config=tsconfig.lit.json',
    'node ./scripts/process-css.mjs --config=tsconfig.lit.json',
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

function rebuild() {
  const commands = [
    'node ./scripts/build.mjs --config=tsconfig.lit.json',
    'node ./scripts/process-css.mjs --config=tsconfig.lit.json',
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
initialBuild();
