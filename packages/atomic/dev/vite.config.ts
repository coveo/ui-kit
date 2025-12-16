import {resolve} from 'node:path';
import {defineConfig, type Plugin} from 'vite';

function configureAssetPaths(): Plugin {
  return {
    name: 'configure-asset-paths',
    transformIndexHtml(html) {
      let updatedHtml = html.replace(
        /language-assets-path="[^"]*"/g,
        'language-assets-path="/lang"'
      );
      updatedHtml = updatedHtml.replace(
        /icon-assets-path="[^"]*"/g,
        'icon-assets-path="/assets"'
      );
      updatedHtml = updatedHtml.replace(
        /http:\/\/localhost:3000\/atomic\/.*\/assets\//g,
        '/assets/'
      );
      return updatedHtml;
    },
    transform(code, id) {
      if (id.endsWith('.mjs')) {
        let updatedCode = code.replace(
          /language-assets-path="[^"]*"/g,
          'language-assets-path="/lang"'
        );
        updatedCode = updatedCode.replace(
          /icon-assets-path="[^"]*"/g,
          'icon-assets-path="/assets"'
        );

        return {
          code: updatedCode,
        };
      }
      return null;
    },
  };
}

export default defineConfig({
  publicDir: resolve(import.meta.dirname, '../dist/atomic'),
  appType: 'mpa',
  server: {
    port: 3333,
    host: '127.0.0.1',
  },
  plugins: [configureAssetPaths()],
});
