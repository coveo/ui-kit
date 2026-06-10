import {mkdtemp, rm, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

import {transformJsonToOpenAcr} from '../src/openacr/json-to-openacr.js';

const report = {
  report: {
    product: 'Coveo Atomic',
    version: '3.0.0',
    standard: 'WCAG 2.2 AA',
    reportDate: '2026-01-01',
    evaluationMethods: ['axe-core'],
    axeCoreVersion: '4.11.4',
    storybookVersion: '8.0.0',
  },
  components: [
    {
      name: 'atomic-search-box',
      storyCount: 1,
      automated: {
        violations: 0,
        passes: 1,
        incomplete: 0,
        inapplicable: 0,
        criteriaCovered: ['2.4.7'],
        criteriaViolated: [],
        criteriaPassed: ['2.4.7'],
        incompleteDetails: [],
      },
      interactive: {criteriaCovered: ['2.1.1'], testCount: 1, passedCount: 1},
    },
  ],
  criteria: [
    {
      id: '2.4.7',
      name: 'Focus Visible',
      level: 'AA',
      wcagVersion: '2.0',
      conformance: 'supports',
      automatedCoverage: true,
      interactiveCoverage: false,
      manualVerified: false,
      coveredComponents: ['atomic-search-box'],
      violatingComponents: [],
    },
  ],
  summary: {},
};

const manualBaseline = [
  {
    name: 'atomic-search-box',
    category: 'search',
    manual: {
      status: 'complete',
      wcag22Criteria: {'2.4.7-focus-visible': 'fail', '9.9.9-fake': 'pass'},
    },
  },
];

describe('transformJsonToOpenAcr (integration)', () => {
  let dir: string;

  beforeEach(async () => {
    dir = await mkdtemp(path.join(tmpdir(), 'a11y-vpat-'));
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await rm(dir, {recursive: true, force: true});
  });

  it('manual fail overrides automated pass, reflects interactive coverage, and excludes unknown keys', async () => {
    const inputFile = path.join(dir, 'a11y-report.json');
    await writeFile(inputFile, JSON.stringify(report), 'utf8');
    await writeFile(
      path.join(dir, 'manual-audit-search.json'),
      JSON.stringify(manualBaseline),
      'utf8'
    );

    const result = await transformJsonToOpenAcr({
      inputFile,
      outputFile: path.join(dir, 'openacr.yaml'),
      overridesFile: path.join(dir, 'no-overrides.json'),
      manualAuditDir: dir,
    });

    const levelA = result.chapters.success_criteria_level_a.criteria;
    const levelAA = result.chapters.success_criteria_level_aa.criteria;

    const focusVisible = levelAA.find((c) => c.num === '2.4.7');
    expect(focusVisible?.components[0].adherence.level).toBe(
      'does-not-support'
    );
    expect(focusVisible?.components[0].adherence.notes).toContain(
      'Manual audit'
    );

    const keyboard = levelA.find((c) => c.num === '2.1.1');
    expect(keyboard?.components[0].adherence.level).toBe('supports');
    expect(keyboard?.components[0].adherence.notes).toContain('Interactive');

    expect(levelA.find((c) => c.num === '9.9.9')).toBeUndefined();
    expect(levelAA.find((c) => c.num === '9.9.9')).toBeUndefined();
  });
});
