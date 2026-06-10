import {mkdtemp, rm, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

import {
  loadManualAuditData,
  resolveManualConformance,
} from '../src/openacr/manual-audit.js';
import type {
  ManualAuditAggregate,
  OpenAcrConformance,
} from '../src/openacr/types.js';

describe('loadManualAuditData', () => {
  let dir: string;
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    dir = await mkdtemp(path.join(tmpdir(), 'a11y-manual-'));
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await rm(dir, {recursive: true, force: true});
  });

  const writeBaseline = (name: string, data: unknown) =>
    writeFile(path.join(dir, name), JSON.stringify(data), 'utf8');

  it('parses a known criterion key from a complete entry', async () => {
    await writeBaseline('manual-audit-search.json', [
      {
        name: 'atomic-search-box',
        category: 'search',
        manual: {
          status: 'complete',
          wcag22Criteria: {'2.4.7-focus-visible': 'pass'},
        },
      },
    ]);

    const aggregates = await loadManualAuditData(dir);

    expect(aggregates.get('atomic-search-box:2.4.7')).toEqual([
      {
        componentName: 'atomic-search-box',
        criterionId: '2.4.7',
        conformance: 'supports',
      },
    ]);
  });

  it('skips entries whose status is not complete', async () => {
    await writeBaseline('manual-audit-search.json', [
      {
        name: 'atomic-search-box',
        category: 'search',
        manual: {
          status: 'pending',
          wcag22Criteria: {'2.4.7-focus-visible': 'pass'},
        },
      },
    ]);

    expect((await loadManualAuditData(dir)).size).toBe(0);
  });

  it('warns and excludes unknown WCAG criterion keys', async () => {
    await writeBaseline('manual-audit-search.json', [
      {
        name: 'atomic-search-box',
        category: 'search',
        manual: {
          status: 'complete',
          wcag22Criteria: {'9.9.9-fake': 'pass'},
        },
      },
    ]);

    const aggregates = await loadManualAuditData(dir);

    expect(aggregates.size).toBe(0);
    expect(warnSpy).toHaveBeenCalled();
  });
});

describe('resolveManualConformance', () => {
  const aggregate = (
    conformance: OpenAcrConformance
  ): ManualAuditAggregate => ({
    componentName: 'c',
    criterionId: '1.1.1',
    conformance,
  });

  it('applies worst-wins precedence (fail > partial > pass > not-applicable)', () => {
    expect(
      resolveManualConformance([
        aggregate('supports'),
        aggregate('partially-supports'),
        aggregate('does-not-support'),
        aggregate('not-applicable'),
      ])
    ).toBe('does-not-support');

    expect(
      resolveManualConformance([
        aggregate('supports'),
        aggregate('partially-supports'),
      ])
    ).toBe('partially-supports');

    expect(resolveManualConformance([aggregate('supports')])).toBe('supports');

    expect(resolveManualConformance([aggregate('not-applicable')])).toBe(
      'not-applicable'
    );
  });

  it('returns undefined for empty input', () => {
    expect(resolveManualConformance([])).toBeUndefined();
  });
});
