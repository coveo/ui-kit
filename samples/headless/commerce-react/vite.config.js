import react from '@vitejs/plugin-react';
import {defineConfig} from 'vite';
import {viteStaticCopy} from 'vite-plugin-static-copy';
import {generateExternalPackageMappings} from '../../../packages/atomic/scripts/externalPackageMappings.mjs';
import buenoJson from '../../../packages/bueno/package.json';
import headlessJson from '../../../packages/headless/package.json';

const isCDN = process.env.DEPLOYMENT_ENVIRONMENT === 'CDN';
const packageMappings = generateExternalPackageMappings(__dirname);

const headlessVersion = `v${headlessJson.version}`;
const buenoVersion = `v${buenoJson.version}`;

const externalizeDependenciesPlugin = () => {
  return {
    name: 'externalize-dependencies',
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    resolveId: (source, _importer, _options) => {
      if (/^\/(headless|bueno)/.test(source)) {
        return false;
      }

      const packageMapping = packageMappings[source];

      if (packageMapping) {
        if (!isCDN) {
          return false;
        }

        return {
          id: packageMapping.cdn,
          external: 'absolute',
        };
      }

      return null;
    },
  };
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    isCDN &&
      viteStaticCopy({
        targets: [
          {
            src: '../../../packages/bueno/cdn/*',
            dest: `./bueno/${buenoVersion}`,
          },
          {
            src: '../../../packages/headless/cdn/*',
            dest: `./headless/${headlessVersion}`,
          },
        ],
      }),
    isCDN && {...externalizeDependenciesPlugin(), enforce: 'pre'},

    react(),
  ],
  preview: isCDN && {
    port: 5173,
  },
  server: {
    open: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    exclude: ['**/e2e/**', '**/node_modules/**'],
  },
});
