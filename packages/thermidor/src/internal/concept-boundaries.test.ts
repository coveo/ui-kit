import {readdirSync, readFileSync, statSync} from 'node:fs';
import {join} from 'node:path';
import {describe, expect, it} from 'vitest';

// Policed per FILE, not directory: the dispatch tracker reaches into `src/optimistic` by design.
const SOURCE_ROOT = join(import.meta.dirname, '..');

const MAY_IMPORT_OPTIMISTIC = ['index.ts', 'actions/dispatch-tracker.ts'];

// Standalone concepts: a new import is the moment to ask whether they still are.
const MUST_BE_IMPORT_FREE = ['actions/dispatch-coordinator.ts', 'optimistic/stale-scope.ts'];

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

// Re-exports count as imports; parsing specifiers keeps paths named in comments from matching.
function specifiersOf(file: string): string[] {
  const source = readFileSync(join(SOURCE_ROOT, file), 'utf8');
  return [
    ...[...source.matchAll(/^(?:import|export)\b[^'"]*?\bfrom\s*'([^']+)'/gm)],
    ...[...source.matchAll(/^import\s*'([^']+)'/gm)],
  ].map(([, specifier]) => specifier);
}

const SELF = 'internal/concept-boundaries.test.ts';

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
