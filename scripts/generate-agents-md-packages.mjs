/**
 * Generates the `## Packages` section of the root `AGENTS.md` file from the
 * `name`, `description`, and `private` fields of every package's
 * `package.json`.
 *
 * Usage:
 *   node scripts/generate-agents-md-packages.mjs
 */

import {readFileSync, writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {
  getAllPackageDirs,
  getPackageManifestFromPackagePath,
  getPackagePathFromPackageDir,
} from './packages.mjs';

const rootDir = resolve(fileURLToPath(import.meta.url), '..', '..');
const agentsMdPath = resolve(rootDir, 'AGENTS.md');

/**
 * @typedef PackageEntry
 * @property {string} dir - Relative path under `packages/`, e.g. `atomic`.
 * @property {string} name - Value of the manifest's `name` field.
 * @property {string} description - Value of the manifest's `description`
 *   field, or `''` if absent.
 * @property {boolean} isPrivate - `true` when the manifest's `private`
 *   field is exactly `true`, `false` otherwise (including when absent).
 */

/**
 * Builds a `PackageEntry` from a directory path and an already-parsed
 * manifest, applying the `description` and `private` defaulting rules.
 * This is a pure function with no file-system access, kept separate from
 * `readPackageEntry` so it can be exercised directly against arbitrary
 * manifests.
 *
 * @param {string} dir Relative path under `packages/`, e.g. `atomic` or
 *   `atomic-angular/projects/atomic-angular`.
 * @param {Record<string, unknown>} manifest Parsed `package.json` content.
 * @returns {PackageEntry}
 */
export function buildPackageEntryFromManifest(dir, manifest) {
  return {
    dir,
    name: manifest.name,
    description: manifest.description ?? '',
    isPrivate: manifest.private === true,
  };
}

/**
 * Reads the `name`, `description`, and `private` fields from the
 * `package.json` of the given package directory.
 *
 * @param {string} dir Relative path under `packages/`, e.g. `atomic` or
 *   `atomic-angular/projects/atomic-angular`.
 * @returns {PackageEntry}
 */
function readPackageEntry(dir) {
  const fullPath = getPackagePathFromPackageDir(dir);
  const manifest = getPackageManifestFromPackagePath(fullPath);
  return buildPackageEntryFromManifest(dir, manifest);
}

/**
 * Renders a single Markdown list item for a package entry: a link whose
 * text is the manifest name in inline code and whose target is the
 * package directory, followed by the description (omitted when empty).
 *
 * @param {PackageEntry} entry
 * @returns {string}
 */
export function renderPackageEntry(entry) {
  const link = `packages/${entry.dir}/`;
  const descriptionSuffix = entry.description ? `: ${entry.description}` : '';
  return `- [\`${entry.name}\`](${link})${descriptionSuffix}`;
}

const AUTO_GENERATED_MARKER =
  '<!-- AUTO-GENERATED: run `pnpm run generate:agents-md-packages` to update this section. Do not edit by hand. -->';

/**
 * Compares two package entries by their `dir` field using standard string
 * comparison, for use as an alphabetical `Array#sort` comparator.
 *
 * @param {PackageEntry} a
 * @param {PackageEntry} b
 * @returns {number}
 */
function byDir(a, b) {
  if (a.dir < b.dir) return -1;
  if (a.dir > b.dir) return 1;
  return 0;
}

/**
 * Renders a `### Public` or `### Private` subsection heading followed by
 * its entries, one per line. Entries are sorted alphabetically by `dir`
 * before rendering.
 *
 * @param {string} heading `### Public` or `### Private`.
 * @param {PackageEntry[]} entries
 * @returns {string[]} Lines to append to the section, including a leading
 *   blank line separating this subsection from the previous content.
 */
function renderSubsection(heading, entries) {
  const sorted = [...entries].sort(byDir);
  return ['', heading, '', ...sorted.map(renderPackageEntry)];
}

/**
 * Renders the full replacement content for the `## Packages` section,
 * including heading, auto-generated marker, and Public/Private
 * subsections. Entries are partitioned by `isPrivate`: entries with
 * `isPrivate === false` render under `### Public`, entries with
 * `isPrivate === true` render under `### Private`, with `### Public`
 * always rendered before `### Private`. A subsection with no entries is
 * omitted entirely (its heading is not rendered).
 *
 * @param {PackageEntry[]} entries
 * @returns {string}
 */
export function renderPackagesSection(entries) {
  const publicEntries = entries.filter((entry) => !entry.isPrivate);
  const privateEntries = entries.filter((entry) => entry.isPrivate);

  const lines = ['## Packages', '', AUTO_GENERATED_MARKER];

  if (publicEntries.length > 0) {
    lines.push(...renderSubsection('### Public', publicEntries));
  }

  if (privateEntries.length > 0) {
    lines.push(...renderSubsection('### Private', privateEntries));
  }

  return `${lines.join('\n')}\n`;
}

/**
 * Replaces the `## Packages` section of `AGENTS.md` content with
 * `newSection`, leaving every other line unchanged. The section is defined
 * as starting at the line beginning with `## Packages` (inclusive) and
 * ending immediately before the next line beginning with `## ` (or at the
 * end of the file if no such line follows). Exactly one blank line is kept
 * between `newSection` and the next `## `-prefixed heading (or, when there
 * is no following heading, after `newSection`), matching the blank-line
 * convention used between sections elsewhere in `AGENTS.md`.
 *
 * @param {string} agentsMdContent
 * @param {string} newSection
 * @returns {string}
 */
export function replacePackagesSection(agentsMdContent, newSection) {
  const lines = agentsMdContent.split('\n');
  const headingIndex = lines.findIndex((line) =>
    line.startsWith('## Packages')
  );

  if (headingIndex === -1) {
    throw new Error('Could not find "## Packages" heading in AGENTS.md');
  }

  let nextHeadingIndex = -1;
  for (let i = headingIndex + 1; i < lines.length; i++) {
    if (lines[i].startsWith('## ')) {
      nextHeadingIndex = i;
      break;
    }
  }

  const before = lines.slice(0, headingIndex);
  const after = nextHeadingIndex === -1 ? [] : lines.slice(nextHeadingIndex);

  const newSectionLines = newSection.split('\n');
  if (newSectionLines[newSectionLines.length - 1] === '') {
    newSectionLines.pop();
  }

  const resultLines =
    after.length === 0
      ? [...before, ...newSectionLines, '']
      : [...before, ...newSectionLines, '', ...after];

  return resultLines.join('\n');
}

/**
 * Discovers every package directory, builds its `PackageEntry`, and
 * rewrites the `## Packages` section of the root `AGENTS.md` file with the
 * regenerated content.
 */
function main() {
  const dirs = getAllPackageDirs();
  const entries = dirs.map(readPackageEntry);

  const newSection = renderPackagesSection(entries);

  const agentsMdContent = readFileSync(agentsMdPath, 'utf-8');
  const updatedContent = replacePackagesSection(agentsMdContent, newSection);
  writeFileSync(agentsMdPath, updatedContent);

  const publicCount = entries.filter((entry) => !entry.isPrivate).length;
  const privateCount = entries.length - publicCount;
  console.log(
    `Updated: AGENTS.md (${entries.length} packages: ${publicCount} public, ${privateCount} private)`
  );
}

main();
