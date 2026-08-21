import {resolve} from 'node:path';

const packagesDir = resolve(import.meta.dirname, '../..');

const atomicSrc = resolve(packagesDir, 'atomic/src');
const headlessSrc = resolve(packagesDir, 'headless/src');
const buenoSrc = resolve(packagesDir, 'bueno/src');
const relaySrc = resolve(packagesDir, 'relay/src');

/**
 * Bare specifiers the playground resolves to workspace source instead of built output.
 *
 * `@coveo/platform-mock-api` is absent on purpose: it declares `source` conditions in its
 * `exports`, so `resolve.conditions` already resolves all of its subpaths to source.
 */
const sourceMappings: Record<string, string> = {
  '@coveo/atomic': resolve(atomicSrc, 'index.ts'),
  '@coveo/atomic/loader': resolve(atomicSrc, 'loader.ts'),
  '@coveo/headless': resolve(headlessSrc, 'index.ts'),
  '@coveo/headless/case-assist': resolve(headlessSrc, 'case-assist.index.ts'),
  '@coveo/headless/commerce': resolve(headlessSrc, 'commerce.index.ts'),
  '@coveo/headless/insight': resolve(headlessSrc, 'insight.index.ts'),
  '@coveo/headless/recommendation': resolve(headlessSrc, 'recommendation.index.ts'),
  '@coveo/bueno': resolve(buenoSrc, 'index.ts'),
  '@coveo/relay': resolve(relaySrc, 'relay.ts'),
};

const themesPrefix = '@coveo/atomic/themes/';

/**
 * Resolves a bare specifier to its source file, or `undefined` when the specifier is not
 * one the playground redirects.
 */
export function resolveToSource(specifier: string): string | undefined {
  if (specifier.startsWith(themesPrefix)) {
    return resolve(atomicSrc, 'themes', specifier.slice(themesPrefix.length));
  }
  return sourceMappings[specifier];
}

export const atomicPackageRoot = resolve(packagesDir, 'atomic');
