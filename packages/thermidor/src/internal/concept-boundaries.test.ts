import {readdirSync, readFileSync, statSync} from 'node:fs';
import {join} from 'node:path';
import {describe, expect, it} from 'vitest';

/**
 * The directories here separate concerns, and this test keeps that separation honest rather than
 * leaving it to good intentions. `src/actions` holds the client-side dispatch coordination (the
 * queue, its dropping rules, and the tracker that drives them); `src/optimistic` holds the
 * view-facing primitives (the held value and the stale regions). The tracker reaches from the
 * first into the second BY DESIGN — it marks regions as it dispatches — so the policed unit is the
 * FILE, not the directory.
 *
 * Two modules are kept free of ANY import because they are self-contained concepts with no
 * dependency to earn: `dispatch-coordinator.ts` (the queue algebra) and `stale-scope.ts` (the
 * region bookkeeping). A new import into either is the moment to ask whether the concept is still
 * standalone.
 */
const SOURCE_ROOT = join(import.meta.dirname, '..');

/** Files outside `src/optimistic` allowed to pull it in: the barrel, and the dispatch tracker. */
const MAY_IMPORT_OPTIMISTIC = ['index.ts', 'actions/dispatch-tracker.ts'];

/** Self-contained concepts: no dependency to earn, so they carry no import at all. */
const MUST_BE_IMPORT_FREE = ['actions/dispatch-coordinator.ts', 'optimistic/stale-scope.ts'];

/** What the controller may reach for: the queue it declares against, and its own directory. */
const CONTROLLER = 'optimistic/optimistic-value.ts';
const CONTROLLER_MAY_IMPORT = ['@/src/actions/', '@/src/optimistic/'];

function sourceFiles(directory: string, prefix = ''): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const absolute = join(directory, entry);
    if (statSync(absolute).isDirectory()) {
      return sourceFiles(absolute, `${prefix}${entry}/`);
    }
    return entry.endsWith('.ts') ? [`${prefix}${entry}`] : [];
  });
}

/**
 * Every module a file pulls in — `import … from`, `export … from`, and a bare side-effect import
 * alike. A re-export pulls the module in just as an import does, so counting only `import` would
 * leave the one hole that matters.
 *
 * Specifiers, deliberately, and not a text search for the directory name: a path named in a
 * comment is a cross-reference, not a dependency, and reading one as an importer would fail this
 * test with a message about something that does not exist.
 */
function specifiersOf(file: string): string[] {
  const source = readFileSync(join(SOURCE_ROOT, file), 'utf8');
  return [
    ...[...source.matchAll(/^(?:import|export)\b[^'"]*?\bfrom\s*'([^']+)'/gm)],
    ...[...source.matchAll(/^import\s*'([^']+)'/gm)],
  ].map(([, specifier]) => specifier);
}

/** This file names the directories in order to police them, so it never counts as an importer. */
const SELF = 'internal/removable-boundaries.test.ts';

function importersOf(directory: string): string[] {
  return sourceFiles(SOURCE_ROOT)
    .filter((file) => file !== SELF && !file.startsWith(`${directory}/`))
    .filter((file) => specifiersOf(file).some((it) => it.startsWith(`@/src/${directory}/`)));
}

describe('concept boundaries', () => {
  it('is reached only through the barrel and by the dispatch tracker — src/optimistic', () => {
    expect(importersOf('optimistic').sort()).toEqual([...MAY_IMPORT_OPTIMISTIC].sort());
  });

  it('keeps the self-contained concepts free of any import at all', () => {
    for (const file of MUST_BE_IMPORT_FREE) {
      expect(specifiersOf(file), file).toEqual([]);
    }
  });

  it('keeps the controller reaching for the queue and its own directory, nothing else', () => {
    for (const specifier of specifiersOf(CONTROLLER).filter((it) => it.startsWith('@/'))) {
      expect(
        CONTROLLER_MAY_IMPORT.some((allowed) => specifier.startsWith(allowed)),
        `${CONTROLLER} imports ${specifier}`
      ).toBe(true);
    }
  });
});
