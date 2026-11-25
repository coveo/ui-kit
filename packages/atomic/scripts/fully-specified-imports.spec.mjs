import {mkdirSync, mkdtempSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import {findUnspecifiedImports, moduleSpecifiers} from './fully-specified-imports.mjs';

const packageRoot = dirname(dirname(fileURLToPath(import.meta.url)));

describe('fully-specified-imports', () => {
  // Parsing every built module takes a few seconds, more than the default timeout on a busy runner.
  it('should name the file in every import of the npm build', () => {
    expect(
      findUnspecifiedImports(packageRoot),
      'These imports of the npm build do not name a file. Webpack and Rspack resolve the imports of an ES module package without trying file extensions, so every app that reaches them fails to build. Name the file in the source import, extension included (for example `dayjs/plugin/utc.js`), or fix the build step that writes the import'
    ).toEqual([]);
  }, 30_000);

  describe('#moduleSpecifiers', () => {
    it('should collect static imports and re-exports', () => {
      const specifiers = moduleSpecifiers(
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

    it('should collect import() and require() calls with a literal specifier', () => {
      const specifiers = moduleSpecifiers(
        'a.cjs',
        'const b = require("./b.cjs");\nconst locales = {fr: () => import("dayjs/locale/fr.js"), de: () => import(`dayjs/locale/de.js`)};'
      );

      expect(specifiers).toEqual(['./b.cjs', 'dayjs/locale/fr.js', 'dayjs/locale/de.js']);
    });

    it('should ignore calls with a computed specifier', () => {
      const specifiers = moduleSpecifiers(
        'a.js',
        'export const load = (locale) => import("./locales/" + locale + ".js");\nconst c = require(name);'
      );

      expect(specifiers).toEqual([]);
    });

    it('should ignore specifiers that only appear in strings and comments', () => {
      const specifiers = moduleSpecifiers(
        'a.js',
        ['// import "./comment";', 'export const text = "import(\'./string\')";'].join('\n')
      );

      expect(specifiers).toEqual([]);
    });
  });

  describe('#findUnspecifiedImports', () => {
    let root;

    /** @param {Record<string, string>} files Contents by path relative to the package root. */
    const writeFiles = (files) => {
      for (const [path, content] of Object.entries(files)) {
        const file = join(root, path);
        mkdirSync(dirname(file), {recursive: true});
        writeFileSync(file, content);
      }
    };

    beforeEach(() => {
      root = mkdtempSync(join(tmpdir(), 'atomic-fully-specified-imports-'));
      writeFiles({'dist/esm/index.js': '', 'dist/cjs/index.cjs': ''});
    });

    afterEach(() => {
      rmSync(root, {recursive: true, force: true});
    });

    it('should report a relative import that leaves out the extension', () => {
      writeFiles({
        'dist/esm/decorators/styles.js': 'import styles from "../utils/global.tw.css";',
        'dist/esm/utils/global.tw.css.js': 'export default "";',
      });

      expect(findUnspecifiedImports(root)).toEqual([
        "dist/esm/decorators/styles.js: '../utils/global.tw.css' should be '../utils/global.tw.css.js'",
      ]);
    });

    it('should report an import of a file in a package without an exports map', () => {
      writeFiles({
        'node_modules/dayjs/package.json': '{"name": "dayjs", "main": "dayjs.min.js"}',
        'node_modules/dayjs/plugin/utc.js': '',
        'node_modules/dayjs/locale/fr.js': '',
        'dist/esm/date.js': [
          'import utc from "dayjs/plugin/utc";',
          'export const locales = {fr: () => import("dayjs/locale/fr")};',
        ].join('\n'),
      });

      expect(findUnspecifiedImports(root)).toEqual([
        "dist/esm/date.js: 'dayjs/plugin/utc' should be 'dayjs/plugin/utc.js'",
        "dist/esm/date.js: 'dayjs/locale/fr' should be 'dayjs/locale/fr.js'",
      ]);
    });

    it('should report a relative require() of the CommonJS build that leaves out the extension', () => {
      writeFiles({
        'dist/cjs/decorators/styles.cjs': 'const styles = require("../utils/global.tw.css");',
        'dist/cjs/utils/global.tw.css.cjs': 'module.exports = "";',
      });

      expect(findUnspecifiedImports(root)).toEqual([
        "dist/cjs/decorators/styles.cjs: '../utils/global.tw.css' should be '../utils/global.tw.css.cjs'",
      ]);
    });

    it('should report a subpath that the exports map of its package does not declare', () => {
      writeFiles({
        'node_modules/lit/package.json': JSON.stringify({
          name: 'lit',
          exports: {
            '.': './index.js',
            './decorators.js': {types: './decorators.d.ts', default: './decorators.js'},
          },
        }),
        'node_modules/lit/decorators.js': '',
        'dist/esm/index.js': [
          'import {property} from "lit/decorators";',
          'import {missing} from "lit/missing.js";',
        ].join('\n'),
      });

      expect(findUnspecifiedImports(root)).toEqual([
        "dist/esm/index.js: 'lit/decorators' should be 'lit/decorators.js'",
        "dist/esm/index.js: 'lit/missing.js' names no file",
      ]);
    });

    it('should report an exported subpath whose target names no file', () => {
      writeFiles({
        'node_modules/fixture/package.json': '{"name": "fixture", "exports": {"./*": "./*"}}',
        'node_modules/fixture/feature.js': '',
        'dist/esm/index.js': 'import "fixture/feature";',
      });

      expect(findUnspecifiedImports(root)).toEqual([
        "dist/esm/index.js: 'fixture/feature' should be 'fixture/feature.js'",
      ]);
    });

    it('should only check the relative imports of the CommonJS build', () => {
      writeFiles({
        'node_modules/dayjs/package.json': '{"name": "dayjs", "main": "dayjs.min.js"}',
        'node_modules/dayjs/plugin/utc.js': '',
        'dist/cjs/index.cjs': [
          'const utc = require("dayjs/plugin/utc");',
          'const {property} = require("lit/decorators");',
        ].join('\n'),
      });

      expect(findUnspecifiedImports(root)).toEqual([]);
    });

    it('should report an import of a file that does not exist', () => {
      writeFiles({'dist/esm/index.js': 'import "./missing.js";'});

      expect(findUnspecifiedImports(root)).toEqual([
        "dist/esm/index.js: './missing.js' names no file",
      ]);
    });

    it('should report an import of a file in a package that is not installed', () => {
      writeFiles({'dist/esm/index.js': 'import utc from "dayjs/plugin/utc.js";'});

      expect(findUnspecifiedImports(root)).toEqual([
        "dist/esm/index.js: 'dayjs/plugin/utc.js' comes from dayjs, which is not installed",
      ]);
    });

    it('should accept imports that name their file, packages and subpaths of an exports map', () => {
      writeFiles({
        'node_modules/dayjs/package.json': '{"name": "dayjs", "main": "dayjs.min.js"}',
        'node_modules/dayjs/plugin/utc.js': '',
        'node_modules/@coveo/headless/package.json': JSON.stringify({
          name: '@coveo/headless',
          exports: {
            '.': './dist/index.js',
            './commerce': {
              types: './dist/commerce.d.ts',
              node: './dist/node/commerce.js',
              import: './dist/commerce.js',
            },
          },
        }),
        'node_modules/@coveo/headless/dist/commerce.js': '',
        'node_modules/lit-html/package.json': JSON.stringify({
          name: 'lit-html',
          exports: {
            './directives/*': {
              browser: {development: './development/directives/*', default: './directives/*'},
              default: './directives/*',
            },
          },
        }),
        'node_modules/lit-html/directives/when.js': '',
        'dist/esm/index.js': [
          'import {html} from "lit";',
          'import {buildCart} from "@coveo/headless/commerce";',
          'import {when} from "lit-html/directives/when.js";',
          'import utc from "dayjs/plugin/utc.js";',
          'export {helper} from "./utils/helper.js";',
          'export const lazy = () => import("./components/lazy.js");',
        ].join('\n'),
        'dist/esm/utils/helper.js': 'export const helper = 1;',
        'dist/esm/components/lazy.js': 'export default {};',
        'dist/cjs/index.cjs': 'const helper = require("./utils/helper.cjs");',
        'dist/cjs/utils/helper.cjs': 'module.exports = {};',
      });

      expect(findUnspecifiedImports(root)).toEqual([]);
    });

    it('should ask for a build when the build output does not exist', () => {
      rmSync(join(root, 'dist'), {recursive: true, force: true});

      expect(() => findUnspecifiedImports(root)).toThrow(
        'dist/esm does not exist. Build the package first'
      );
    });
  });
});
