import esbuild from 'esbuild';
import {readFileSync} from 'node:fs';
import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const buenoJson = JSON.parse(
  readFileSync(resolve(__dirname, '../../bueno/package.json'), 'utf8')
);
const headlessJson = JSON.parse(
  readFileSync(resolve(__dirname, '../../headless/package.json'), 'utf8')
);
const isNightly = process.env.IS_NIGHTLY === 'true';
const headlessVersion = isNightly
  ? `v${headlessJson.version.split('.').shift()}-nightly`
  : 'v' + headlessJson.version;
const buenoVersion = isNightly
  ? `v${buenoJson.version.split('.').shift()}-nightly`
  : 'v' + buenoJson.version;
const packageMappings = {
  '@coveo/headless': `/headless/${headlessVersion}/headless.esm.js`,
  '@coveo/bueno': `/bueno/${buenoVersion}/bueno.esm.js`,
};

const externalizeDependenciesPlugin = {
  name: 'externalize-dependencies',
  setup(build) {
    build.onResolve({filter: /.*/}, (args) => {
      const packageMapping = packageMappings[args.path];

      if (packageMapping) {
        return {
          path: packageMapping,
          external: true,
        };
      }

      return null;
    });
  },
};

esbuild
  .build({
    format: 'esm',
    target: 'es2022',
    entryPoints: [
      './src/index.ts',
      './src/atomic-hosted-page.esm.ts',
      './src/components/atomic-hosted-ui/atomic-hosted-ui.ts',
    ],
    outdir: './cdn',
    chunkNames: 'chunks/[name].[hash]',
    bundle: true,
    external: ['@coveo/headless', '@coveo/bueno'],
    splitting: true,
    plugins: [externalizeDependenciesPlugin],
  })
  .then(() => console.log('Build successful!'))
  .catch((err) => {
    console.error('Build failed:', err);
    process.exit(1);
  });
