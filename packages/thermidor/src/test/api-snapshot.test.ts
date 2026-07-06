import {describe, expect, it} from 'vitest';
import * as API from '@/src/index.js';
import {readFileSync} from 'node:fs';
import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const srcRoot = resolve(__dirname, '..');

// TODO KIT-5859 - Reactivate when public API surface is more stable
describe.skip('API Snapshot Gate', () => {
  describe('public API surface stability', () => {
    it('exports exactly the expected set of symbols', () => {
      const exportedSymbols = Object.keys(API).sort();
      expect(exportedSymbols).toMatchSnapshot();
    });

    it('has not added or removed any exports', () => {
      const exportedSymbols = Object.keys(API).sort();
      expect(exportedSymbols.length).toBeGreaterThan(0);
      expect(exportedSymbols).toMatchSnapshot();
    });
  });

  describe('implementation type leak detection', () => {
    it('does not export symbols whose source references @reduxjs/toolkit or immer in index.ts', () => {
      const indexPath = resolve(srcRoot, 'index.ts');
      const indexContent = readFileSync(indexPath, 'utf-8');

      const leakedImports = indexContent
        .split('\n')
        .filter(
          (line) =>
            (line.includes('@reduxjs/toolkit') || line.includes('immer')) &&
            !line.trimStart().startsWith('//')
        );

      expect(leakedImports).toEqual([]);
    });

    it('does not re-export symbols from files that import @reduxjs/toolkit or immer in public barrels', () => {
      const filesToCheck = [
        resolve(srcRoot, 'public/actions/index.ts'),
        resolve(srcRoot, 'public/controllers/index.ts'),
      ];

      const violations: string[] = [];

      for (const filePath of filesToCheck) {
        const content = readFileSync(filePath, 'utf-8');
        const importLines = content
          .split('\n')
          .filter((line) => line.match(/from\s+['"]/));

        for (const line of importLines) {
          if (
            line.includes('@reduxjs/toolkit') ||
            line.includes("'immer'") ||
            line.includes('"immer"')
          ) {
            violations.push(`${filePath}: ${line.trim()}`);
          }
        }
      }

      expect(violations).toEqual([]);
    });

    it('detects if any exported value-level symbol type references @reduxjs/toolkit or immer', () => {
      const indexPath = resolve(srcRoot, 'index.ts');
      const indexContent = readFileSync(indexPath, 'utf-8');

      const importSources = indexContent
        .split('\n')
        .map((line) => {
          const match = line.match(/from\s+['"](.+?)['"]/);
          return match ? match[1] : null;
        })
        .filter(Boolean) as string[];

      const resolvedSources = importSources.map((source) => {
        if (source.startsWith('@/')) {
          return resolve(
            srcRoot,
            '..',
            source.replace('@/', '').replace(/\.js$/, '.ts')
          );
        }
        if (source.startsWith('./') || source.startsWith('../')) {
          return resolve(srcRoot, source.replace(/\.js$/, '.ts'));
        }
        return null;
      });

      const violations: string[] = [];

      for (const filePath of resolvedSources) {
        if (!filePath) continue;
        try {
          const content = readFileSync(filePath, 'utf-8');
          const lines = content.split('\n');
          for (const line of lines) {
            if (line.trimStart().startsWith('//')) continue;
            if (
              line.includes("from '@reduxjs/toolkit'") ||
              line.includes('from "@reduxjs/toolkit"') ||
              line.includes("from '@reduxjs/toolkit/") ||
              line.includes('from "@reduxjs/toolkit/') ||
              line.includes("from 'immer'") ||
              line.includes('from "immer"')
            ) {
              if (line.match(/^\s*export\s/)) {
                violations.push(`${filePath}: ${line.trim()}`);
              }
            }
          }
        } catch {
          // File might not exist (barrel re-exports), skip gracefully
        }
      }

      expect(violations).toEqual([]);
    });
  });
});
