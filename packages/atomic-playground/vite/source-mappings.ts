import {resolve} from 'node:path';
import {generateExternalPackageMappings} from '../../atomic/scripts/externalPackageMappings.mjs';
import {atomicPackageRoot} from '../../atomic/scripts/vite-source-plugins.js';

const atomicSrc = resolve(atomicPackageRoot, 'src');

/**
 * Bare specifiers the playground resolves to workspace source instead of built output.
 *
 * The Headless, Bueno, Relay and `@coveo/platform-mock-api` entries are taken from the mapping
 * Atomic's Storybook already drives its own source resolution from, so a new subpath only has to
 * be declared in one place. A specifier that is not mapped falls through to `dist`, which would
 * put a second copy of Headless state in the module graph.
 */
const sourceMappings: Record<string, string> = {
  ...Object.fromEntries(
    Object.entries(generateExternalPackageMappings() as Record<string, {local: string}>).map(
      ([specifier, {local}]) => [specifier, local]
    )
  ),
  '@coveo/atomic': resolve(atomicSrc, 'index.ts'),
  '@coveo/atomic/loader': resolve(atomicSrc, 'loader.ts'),
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
