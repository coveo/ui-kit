import {cli} from '@custom-elements-manifest/analyzer/cli.js';
import {packageRoot} from '../manifest.mjs';

/**
 * Builds the manifest of Atomic the way `pnpm run build:cem` does, through the analyzer's CLI
 * and `custom-elements-manifest.config.mjs`, without writing it.
 */
export function analyzeAtomic() {
  return cli({argv: ['analyze', '--quiet'], cwd: packageRoot, noWrite: true});
}
