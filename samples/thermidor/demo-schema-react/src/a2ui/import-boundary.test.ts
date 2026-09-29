import {readdirSync, readFileSync, statSync} from 'node:fs';
import {join, resolve} from 'node:path';
import {describe, expect, it} from 'vitest';
import * as thermidorSchema from '@coveo/thermidor-schema';
import * as thermidor from '@coveo/thermidor';

const srcRoot = resolve(process.cwd(), 'src');

function getAllSourceFiles(directory: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(directory)) {
    const entryPath = join(directory, entry);
    if (statSync(entryPath).isDirectory()) {
      if (entry === 'node_modules' || entry === '__test-shims__') continue;
      files.push(...getAllSourceFiles(entryPath));
    } else if (/\.(ts|tsx)$/.test(entry) && !/\.(test|spec)\.(ts|tsx)$/.test(entry)) {
      files.push(entryPath);
    }
  }
  return files;
}

const sourceFiles = getAllSourceFiles(srcRoot);

describe('import boundary', () => {
  it('does not import from @coveo/thermidor-contracts', () => {
    for (const file of sourceFiles) {
      const content = readFileSync(file, 'utf-8');
      expect(content, `Forbidden import in ${file}`).not.toMatch(/@coveo\/thermidor-contracts/);
    }
  });

  it('does not import non-existent props schemas from @coveo/thermidor-schema', () => {
    const nonExistentImports = [
      /productCarouselPropsSchema.*from\s+['"]@coveo\/thermidor-schema['"]/,
      /cartPropsSchema.*from\s+['"]@coveo\/thermidor-schema['"]/,
    ];
    for (const file of sourceFiles) {
      const content = readFileSync(file, 'utf-8');
      for (const pattern of nonExistentImports) {
        expect(content, `Import of non-existent export in ${file}`).not.toMatch(pattern);
      }
    }
  });

  it('does not export removed controller symbols from @coveo/thermidor-schema', () => {
    expect('ControllerContracts' in thermidorSchema).toBe(false);
    expect('ControllerContractsSchema' in thermidorSchema).toBe(false);
    expect('CartControllerContractSchema' in thermidorSchema).toBe(false);
    expect('ProductListControllerContractSchema' in thermidorSchema).toBe(false);
  });

  it('does not export removed controller symbols from @coveo/thermidor', () => {
    expect('AdvertisedRemoteController' in thermidor).toBe(false);
    expect('RemoteControllerSchemaId' in thermidor).toBe(false);
    // The RemoteController public API is removed under the inline-state model.
    expect('RemoteController' in thermidor).toBe(false);
    expect('RemoteAction' in thermidor).toBe(false);
    expect('RemoteControllerOptions' in thermidor).toBe(false);
  });

  it('exposes dispatchAction as the single action-dispatch entry on the session', () => {
    // The session factory is the only public action-dispatch surface; `dispatchAction`
    // (on the returned Session) replaces the removed RemoteController dispatch.
    expect('createSession' in thermidor).toBe(true);
  });

  it('does not reference removed controller symbols in source files', () => {
    const removedSymbols = [
      /\bControllerContracts\b/,
      /\bControllerContractsSchema\b/,
      /\bCartControllerContractSchema\b/,
      /\bProductListControllerContractSchema\b/,
      /\bAdvertisedRemoteController\b/,
      /\bRemoteControllerSchemaId\b/,
    ];
    for (const file of sourceFiles) {
      const content = readFileSync(file, 'utf-8');
      for (const pattern of removedSymbols) {
        expect(content, `Reference to removed symbol ${pattern} in ${file}`).not.toMatch(pattern);
      }
    }
  });

  it('no source file imports a RemoteController symbol or a controller hook', () => {
    const forbidden = [
      /\bRemoteController\b/,
      /\buseRemoteController\b/,
      /\bsession\.remoteController\b/,
      /\.remoteController\(/,
      /from\s+['"]\.\.?\/(?:.*\/)?controllers\.js['"]/,
      /from\s+['"]\.\.?\/(?:.*\/)?read-child-ids\.js['"]/,
      /\breadChildIds\b/,
    ];
    for (const file of sourceFiles) {
      const content = readFileSync(file, 'utf-8');
      for (const pattern of forbidden) {
        expect(content, `Forbidden RemoteController/controller reference in ${file}`).not.toMatch(
          pattern
        );
      }
    }
  });

  it('the removed controllers.tsx and read-child-ids.ts source files are gone', () => {
    const forbiddenBasenames = ['controllers.tsx', 'controllers.ts', 'read-child-ids.ts'];
    for (const file of sourceFiles) {
      const base = file.split('/').pop();
      expect(forbiddenBasenames, `Removed file still present: ${file}`).not.toContain(base);
    }
  });

  it('no renderer reads props.componentId or props.componentType', () => {
    for (const file of sourceFiles) {
      if (!/\/a2ui\/.+\.tsx$/.test(file)) continue;
      const content = readFileSync(file, 'utf-8');
      expect(content, `props.componentId read in ${file}`).not.toMatch(/props\.componentId\b/);
      expect(content, `props.componentType read in ${file}`).not.toMatch(/props\.componentType\b/);
    }
  });
});
