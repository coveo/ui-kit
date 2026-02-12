import {copyFileSync, existsSync, mkdirSync, writeFileSync} from 'node:fs';
import {resolve} from 'node:path';

/**
 * Writes the generated wrapper to disk.
 *
 * - Copies the original Storybook `index.html` to `storybook-ui/index.html`
 * - Overwrites `index.html` with the custom docs wrapper
 * - Logs a summary of entries processed
 *
 * @param {string} dist       - Absolute path to the dist-storybook directory
 * @param {string} pageHtml   - The full generated HTML document
 * @param {Record<string, { type: string }>} entries - Story manifest entries (for summary)
 */
export function writeOutput(dist, pageHtml, entries) {
  const storybookUiDir = resolve(dist, 'storybook-ui');
  if (!existsSync(storybookUiDir)) {
    mkdirSync(storybookUiDir, {recursive: true});
  }

  const originalIndex = resolve(dist, 'index.html');
  if (existsSync(originalIndex)) {
    copyFileSync(originalIndex, resolve(storybookUiDir, 'index.html'));
    console.log(
      '✅  Preserved original Storybook UI → storybook-ui/index.html'
    );
  }

  writeFileSync(originalIndex, pageHtml, 'utf-8');
  console.log('✅  Generated custom docs wrapper → index.html');

  const storyCount = Object.values(entries).filter(
    (e) => e.type === 'story'
  ).length;
  const docsCount = Object.values(entries).filter(
    (e) => e.type === 'docs'
  ).length;
  console.log(`   📊  ${storyCount} stories + ${docsCount} docs pages`);
}
