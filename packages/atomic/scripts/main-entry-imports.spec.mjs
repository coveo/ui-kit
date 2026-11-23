import {mkdirSync, mkdtempSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import {
  findImportChains,
  findMainEntryLoaderImports,
  importedSpecifiers,
} from './main-entry-imports.mjs';

const packageRoot = dirname(dirname(fileURLToPath(import.meta.url)));

describe('main-entry-imports', () => {
  it('should not reach the lazy loader from the npm main entry', () => {
    expect(
      findMainEntryLoaderImports(packageRoot),
      'The npm main entry reaches the lazy loader through the imports below. An app built with esbuild, like every Angular CLI app, then loads every component as soon as it imports one helper from `@coveo/atomic`. Break each chain: the loader belongs to the `@coveo/atomic/loader` entry only'
    ).toEqual([]);
  });

  describe('#importedSpecifiers', () => {
    it('should collect static imports and re-exports', () => {
      const specifiers = importedSpecifiers(
        'a.js',
        [
          'import "./side-effect.js";',
          'import {b} from "./b.js";',
          'export {c} from "./c.js";',
          'export * from "@scope/package";',
          'export const d = b;',
        ].join('\n')
      );

      expect(specifiers).toEqual(['./side-effect.js', './b.js', './c.js', '@scope/package']);
    });

    it('should collect import() calls with a literal specifier', () => {
      const specifiers = importedSpecifiers(
        'a.js',
        'export const map = {"atomic-a": async () => await import("./atomic-a.js"), "atomic-b": () => import(`./atomic-b.js`)};'
      );

      expect(specifiers).toEqual(['./atomic-a.js', './atomic-b.js']);
    });

    it('should ignore import() calls with a computed specifier', () => {
      const specifiers = importedSpecifiers(
        'a.js',
        'export const load = (locale) => import("./locales/" + locale + ".js");'
      );

      expect(specifiers).toEqual([]);
    });

    it('should ignore specifiers that only appear in strings and comments', () => {
      const specifiers = importedSpecifiers(
        'a.js',
        ['// import "./comment.js";', 'export const text = "import(\'./string.js\')";'].join('\n')
      );

      expect(specifiers).toEqual([]);
    });
  });

  describe('#findImportChains', () => {
    /** @param {Record<string, string[]>} graph */
    const importsIn = (graph) => (file) => graph[file] ?? [];
    const isLoader = (file) => file === 'loader';

    it('should return the chain of imports that leads to a forbidden file', () => {
      const graph = {entry: ['helper'], helper: ['utils', 'loader'], utils: []};

      expect(findImportChains('entry', importsIn(graph), isLoader)).toEqual([
        ['entry', 'helper', 'loader'],
      ]);
    });

    it('should return the shortest chain when several lead to the same file', () => {
      const graph = {entry: ['a', 'loader'], a: ['b'], b: ['loader']};

      expect(findImportChains('entry', importsIn(graph), isLoader)).toEqual([['entry', 'loader']]);
    });

    it('should return one chain per forbidden file', () => {
      const graph = {entry: ['a', 'b'], a: ['loader'], b: ['lazy-index']};

      expect(
        findImportChains('entry', importsIn(graph), (file) =>
          ['loader', 'lazy-index'].includes(file)
        )
      ).toEqual([
        ['entry', 'a', 'loader'],
        ['entry', 'b', 'lazy-index'],
      ]);
    });

    it('should not follow the imports of a forbidden file', () => {
      const visited = [];
      const graph = {entry: ['loader'], loader: ['component']};

      findImportChains(
        'entry',
        (file) => {
          visited.push(file);
          return graph[file] ?? [];
        },
        isLoader
      );

      expect(visited).toEqual(['entry']);
    });

    it('should return no chain when no forbidden file is reachable, even through an import cycle', () => {
      const graph = {entry: ['a'], a: ['b'], b: ['a'], loader: ['a']};

      expect(findImportChains('entry', importsIn(graph), isLoader)).toEqual([]);
    });
  });

  describe('#findMainEntryLoaderImports', () => {
    let root;

    /** @param {Record<string, string>} files Contents by path relative to `dist/esm`. */
    const writeBuildOutput = (files) => {
      for (const [path, content] of Object.entries(files)) {
        const file = join(root, 'dist/esm', path);
        mkdirSync(dirname(file), {recursive: true});
        writeFileSync(file, content);
      }
    };

    beforeEach(() => {
      root = mkdtempSync(join(tmpdir(), 'atomic-main-entry-'));
    });

    afterEach(() => {
      rmSync(root, {recursive: true, force: true});
    });

    it('should report a main entry that re-exports the loader', () => {
      writeBuildOutput({
        'index.js': 'export {defineCustomElements} from "./loader.js";',
        'loader.js': 'import {registerAutoloader} from "./autoloader/index.js";',
        'autoloader/index.js': 'import elementMap from "../components/lazy-index.js";',
        'components/lazy-index.js': 'export default {};',
      });

      expect(findMainEntryLoaderImports(root)).toEqual([
        'dist/esm/index.js → dist/esm/loader.js → dist/esm/autoloader/index.js',
      ]);
    });

    it('should report a lazy-index file reached through an import() call', () => {
      writeBuildOutput({
        'index.js': 'export {helper} from "./utils/helper.js";',
        'utils/helper.js':
          'export const helper = () => import("../components/search/lazy-index.js");',
        'components/search/lazy-index.js': 'export default {};',
      });

      expect(findMainEntryLoaderImports(root)).toEqual([
        'dist/esm/index.js → dist/esm/utils/helper.js → dist/esm/components/search/lazy-index.js',
      ]);
    });

    it('should accept a main entry that only reaches helpers, other packages and assets', () => {
      writeBuildOutput({
        'index.js': [
          'export * from "@coveo/atomic-legacy/item-decorators";',
          'export {helper} from "./utils/helper.js";',
        ].join('\n'),
        'utils/helper.js': 'import styles from "./helper.css";\nexport const helper = styles;',
        'loader.js': 'import {registerAutoloader} from "./autoloader/index.js";',
        'autoloader/index.js': 'export const registerAutoloader = () => {};',
      });

      expect(findMainEntryLoaderImports(root)).toEqual([]);
    });

    it('should ask for a build when the main entry does not exist', () => {
      expect(() => findMainEntryLoaderImports(root)).toThrow(
        'dist/esm/index.js does not exist. Build the package first'
      );
    });
  });
});
