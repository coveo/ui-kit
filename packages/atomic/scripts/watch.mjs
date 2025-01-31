import {execSync} from 'node:child_process';
import {watch, cpSync} from 'node:fs';
import {createServer} from 'node:http';

function checkPort(port) {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(true);
      } else {
        reject(err);
      }
    });
    server.once('listening', () => {
      server.close();
      resolve(false);
    });
    server.listen(port);
  });
}

async function rebuild() {
  const commands = [
    'node --max_old_space_size=6144 ../../node_modules/@stencil/core/bin/stencil build --tsConfig tsconfig.stencil.json',
    'node ./scripts/stencil-proxy.mjs',
    'node ./scripts/build.mjs --config=tsconfig.lit.json',
    'node ./scripts/process-css.mjs --config=tsconfig.lit.json ',
    'if [ "$DEPLOYMENT_ENVIRONMENT" == "CDN" ]; then rollup -c rollup.config.js; fi',
    'esbuild src/autoloader/index.ts --format=esm --outfile=dist/atomic/autoloader/index.esm.js',
    'esbuild src/autoloader/index.ts --format=cjs --outfile=dist/atomic/autoloader/index.cjs.js',
  ];
  for (const command of commands) {
    execSync(command, {
      stdio: 'inherit',
      env: {...process.env, IS_DEV: 'true'},
    });
  }
  if (await checkPort(4400)) {
    cpSync('./dist/atomic', './dist-storybook/assets', {recursive: true});
    cpSync('./dist/atomic/lang', './dist-storybook/lang', {recursive: true});
  }
}

watch('src', {recursive: true}, rebuild);
rebuild();
