import {resolve} from 'node:path';
import {defineConfig, type Plugin, type ViteDevServer} from 'vite';

const DEFAULT_PORT = 3400;
const port = process.env.PLAYGROUND_PORT
  ? Number.parseInt(process.env.PLAYGROUND_PORT, 10)
  : DEFAULT_PORT;

const atomicDist = resolve(import.meta.dirname, '../atomic/dist');
const headlessDist = resolve(import.meta.dirname, '../headless/dist/esm');

const RELOAD_DEBOUNCE_MS = 300;

/**
 * Reloads the page when the watched Atomic or Headless builds emit new output.
 *
 * A full reload is required rather than a hot update: the browser refuses to
 * re-register an already defined custom element, so patching a component module
 * in place would leave the previous definition running.
 *
 * Both watch builds emit many files per change, so reloads are debounced to
 * avoid refreshing the page in the middle of a rebuild.
 */
function reloadOnDependencyRebuild(): Plugin {
  let server: ViteDevServer | undefined;
  let timeout: NodeJS.Timeout | undefined;

  const scheduleReload = () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      server?.ws.send({type: 'full-reload', path: '*'});
    }, RELOAD_DEBOUNCE_MS);
  };

  return {
    name: 'reload-on-dependency-rebuild',
    configureServer(devServer) {
      server = devServer;
      devServer.watcher.add([atomicDist, headlessDist]);
      devServer.watcher.on('add', scheduleReload);
      devServer.watcher.on('change', scheduleReload);
    },
  };
}

export default defineConfig({
  publicDir: atomicDist,
  appType: 'mpa',
  server: {
    port,
    strictPort: true,
    host: '127.0.0.1',
    watch: {
      ignored: ['!**/dist/**'],
    },
  },
  optimizeDeps: {
    exclude: ['@coveo/atomic', '@coveo/headless'],
  },
  plugins: [reloadOnDependencyRebuild()],
});
