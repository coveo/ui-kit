import {readFileSync} from 'node:fs';
import path, {dirname, resolve} from 'node:path';
import type {PluginImpl} from 'rollup';
import {defineConfig} from 'vite';

const resolvePathAliases: PluginImpl = () => {
  return {
    name: 'resolve-path-aliases',
    async resolveId(source: string, importer, options) {
      if (source.startsWith('@/')) {
        const aliasPath = source.slice(2); // Remove the "@/" prefix
        const resolvedPath = path.resolve(__dirname, `../${aliasPath}`);

        return this.resolve(resolvedPath, importer, options);
      }
    },
  };
};

const forceInlineCssImports: PluginImpl = () => {
  return {
    name: 'force-inline-css-imports',
    enforce: 'pre',
    transform(code, id) {
      if (id.endsWith('.ts')) {
        return {
          code: code.replace(
            /import\s+([^'"]+)\s+from\s+['"]([^'"]+\.css)['"]/g,
            (_, importName, cssPath) =>
              `import ${importName} from '${cssPath}?inline'`
          ),
          map: null,
        };
      }
      return null;
    },
  };
};

const svgTransform: PluginImpl = () => {
  return {
    name: 'svg-transform',
    enforce: 'pre',
    transform(code, id) {
      if (id.endsWith('.ts')) {
        return code.replace(
          /import\s+([a-zA-Z]+)\s+from\s+['"]([^'"]+\.svg)['"]/g,
          (_, importName, importPath) => {
            const svgContent = readFileSync(
              resolve(dirname(id), importPath),
              'utf8'
            ).replace(/'/g, "\\'");
            return `const ${importName} = '${svgContent}';`;
          }
        );
      }
      return null;
    },
  };
};

export default defineConfig({
  plugins: [resolvePathAliases(), forceInlineCssImports(), svgTransform()],
});
