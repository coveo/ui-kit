import {mkdtemp, rm, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

import {loadManualAuditData, resolveManualConformance} from '../src/openacr/manual-audit.js';
import type {ManualAuditAggregate, OpenAcrConformance} from '../src/openacr/types.js';

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

  const writeAudit = (name: string, data: unknown) =>
    writeFile(path.join(dir, name), JSON.stringify(data), 'utf8');

  it('parses audited criteria from a surface file, keyed by criterion id', async () => {
    await writeAudit('manual-audit-search.json', {
      surface: 'search',
      wcag22Criteria: {
        '2.4.7-focus-visible': 'pass',
        '1.4.3-contrast-minimum': {
          conformance: 'fail',
          remarks: 'Low contrast on dark theme.',
        },
      },
    });

    const aggregates = await loadManualAuditData(dir);

    expect(aggregates.get('2.4.7')).toEqual([{criterionId: '2.4.7', conformance: 'supports'}]);
    expect(aggregates.get('1.4.3')).toEqual([
      {
        criterionId: '1.4.3',
        conformance: 'does-not-support',
        remarks: 'Low contrast on dark theme.',
      },
    ]);
  });

  it('warns and excludes unknown WCAG criterion keys', async () => {
    await writeAudit('manual-audit-search.json', {
      surface: 'search',
      wcag22Criteria: {'9.9.9-fake': 'pass'},
    });

    const aggregates = await loadManualAuditData(dir);

    expect(aggregates.size).toBe(0);
    expect(warnSpy).toHaveBeenCalled();
  });

  it('skips files that are not a valid audit object (e.g. the legacy array shape)', async () => {
    await writeAudit('manual-audit-legacy.json', [
      {name: 'atomic-search-box', manual: {status: 'complete'}},
    ]);

    const aggregates = await loadManualAuditData(dir);

    expect(aggregates.size).toBe(0);
    expect(warnSpy).toHaveBeenCalled();
  });

  it('merges the same criterion across multiple surface files', async () => {
    await writeAudit('manual-audit-commerce.json', {
      surface: 'commerce',
      wcag22Criteria: {'2.1.4-character-key-shortcuts': 'pass'},
    });
    await writeAudit('manual-audit-insight.json', {
      surface: 'insight',
      wcag22Criteria: {'2.1.4-character-key-shortcuts': 'fail'},
    });

    const aggregates = await loadManualAuditData(dir);

    expect(aggregates.get('2.1.4')).toHaveLength(2);
    expect(resolveManualConformance(aggregates.get('2.1.4'))).toBe('does-not-support');
  });
});

describe('resolveManualConformance', () => {
  const aggregate = (conformance: OpenAcrConformance): ManualAuditAggregate => ({
    criterionId: '1.1.1',
    conformance,
  });

  it('applies worst-wins (does-not-support > partially-supports > supports > not-applicable)', () => {
    expect(
      resolveManualConformance([
        aggregate('supports'),
        aggregate('partially-supports'),
        aggregate('does-not-support'),
        aggregate('not-applicable'),
      ])
    ).toBe('does-not-support');

    expect(resolveManualConformance([aggregate('supports'), aggregate('partially-supports')])).toBe(
      'partially-supports'
    );

    expect(resolveManualConformance([aggregate('supports'), aggregate('not-applicable')])).toBe(
      'supports'
    );

    expect(resolveManualConformance([aggregate('not-applicable')])).toBe('not-applicable');
  });

  it('returns undefined for empty input', () => {
    expect(resolveManualConformance([])).toBeUndefined();
  });
});
