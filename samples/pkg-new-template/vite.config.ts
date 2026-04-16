import {createReadStream, existsSync, cpSync, mkdirSync} from 'node:fs';
import {dirname, join, resolve} from 'node:path';
import {createRequire} from 'node:module';
import {defineConfig, type Plugin} from 'vite';

function resolveAtomicDistDir(): string {
  const require = createRequire(import.meta.url);
  const loaderPath = require.resolve('@coveo/atomic/loader');
  return resolve(dirname(loaderPath), '../atomic');
}

/**
 * Serves Atomic static assets (locale JSON files, SVG icons) that the
 * web-components fetch at runtime via HTTP.
 *
 * - **Dev** — injects Connect middleware so Vite serves the files directly
 *   from `node_modules`.
 * - **Build** — copies the directories into the output folder.
 */
function serveAtomicStaticAssets(): Plugin {
  const dirs = ['lang', 'assets'];
  let atomicDistDir: string;

  return {
    name: 'serve-atomic-static-assets',

    configResolved() {
      atomicDistDir = resolveAtomicDistDir();
    },

    configureServer(server) {
      for (const dir of dirs) {
        server.middlewares.use(`/${dir}`, (req, res, next) => {
          const file = join(atomicDistDir, dir, `.${req.url!.split('?')[0]}`);
          if (existsSync(file)) {
            res.setHeader(
              'Content-Type',
              file.endsWith('.json') ? 'application/json' : 'image/svg+xml'
            );
            createReadStream(file).pipe(res);
          } else {
            next();
          }
        });
      }
    },

    writeBundle(options) {
      const outDir = options.dir || 'dist';
      for (const dir of dirs) {
        const src = join(atomicDistDir, dir);
        const dest = join(outDir, dir);
        if (existsSync(src)) {
          mkdirSync(dest, {recursive: true});
          cpSync(src, dest, {recursive: true});
        }
      }
    },
  };
}

export default defineConfig({
  appType: 'mpa',
  server: {
    port: 3000,
  },
  plugins: [serveAtomicStaticAssets()],
});
