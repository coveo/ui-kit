import {mkdtemp, rm, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

import {transformJsonToOpenAcr} from '../src/openacr/json-to-openacr.js';

// atomic-search-box: 2.4.7 covered+clean (supports), 1.4.3 covered+violation
// (does-not-support). 2.1.4 is absent → not covered by automation.
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
        violations: 1,
        passes: 1,
        incomplete: 0,
        inapplicable: 0,
        criteriaCovered: ['2.4.7', '1.4.3'],
        criteriaViolated: ['1.4.3'],
        criteriaPassed: ['2.4.7'],
        incompleteDetails: [],
      },
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
    {
      id: '1.4.3',
      name: 'Contrast (Minimum)',
      level: 'AA',
      wcagVersion: '2.0',
      conformance: 'doesNotSupport',
      automatedCoverage: true,
      interactiveCoverage: false,
      manualVerified: false,
      coveredComponents: ['atomic-search-box'],
      violatingComponents: ['atomic-search-box'],
    },
  ],
  summary: {},
};

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

  const writeInput = (input: unknown = report) =>
    writeFile(path.join(dir, 'a11y-report.json'), JSON.stringify(input));

  const levelOf = (
    criteria: {num: string; components: {adherence: {level: string}}[]}[],
    num: string
  ) => criteria.find((c) => c.num === num)?.components[0].adherence.level;

  it('resolves each criterion as worst-wins across automated + manual signals', async () => {
    await writeInput();
    await writeFile(
      path.join(dir, 'manual-audit-search.json'),
      JSON.stringify({
        surface: 'search',
        wcag22Criteria: {
          '2.4.7-focus-visible': 'fail',
          '1.4.3-contrast-minimum': 'pass',
          '2.1.4-character-key-shortcuts': 'pass',
        },
      })
    );

    const result = await transformJsonToOpenAcr({
      inputFile: path.join(dir, 'a11y-report.json'),
      outputFile: path.join(dir, 'openacr.yaml'),
      overridesFile: path.join(dir, 'no-overrides.json'),
      manualAuditDir: dir,
    });

    const a = result.chapters.success_criteria_level_a.criteria;
    const aa = result.chapters.success_criteria_level_aa.criteria;

    // manual fail beats an axe-clean criterion
    expect(levelOf(aa, '2.4.7')).toBe('does-not-support');
    // a real axe violation can't be masked by a manual pass
    expect(levelOf(aa, '1.4.3')).toBe('does-not-support');
    // manual fills a criterion axe doesn't cover
    expect(levelOf(a, '2.1.4')).toBe('supports');

    const focusVisible = aa.find((c) => c.num === '2.4.7');
    expect(focusVisible?.components[0].adherence.notes).toContain(
      'manual audit found Does Not Support'
    );
  });

  it('reports incomplete axe evidence without treating it as a pass', async () => {
    await writeInput({
      ...report,
      components: [
        ...report.components,
        {
          name: 'atomic-result-list',
          storyCount: 1,
          automated: {
            violations: 0,
            passes: 0,
            incomplete: 1,
            inapplicable: 0,
            criteriaCovered: ['1.4.4'],
            criteriaViolated: [],
            criteriaPassed: [],
            incompleteDetails: [
              {
                ruleId: 'meta-viewport-large',
                impact: 'moderate',
                wcagCriteria: ['1.4.4'],
                nodes: 1,
                message: 'Manual review required.',
              },
            ],
          },
        },
      ],
    });

    const result = await transformJsonToOpenAcr({
      inputFile: path.join(dir, 'a11y-report.json'),
      outputFile: path.join(dir, 'openacr.yaml'),
      overridesFile: path.join(dir, 'no-overrides.json'),
      manualAuditDir: path.join(dir, 'no-manual'),
    });

    const row = result.chapters.success_criteria_level_aa.criteria.find(
      (criterion) => criterion.num === '1.4.4'
    );
    expect(row?.components[0].adherence.level).toBe('does-not-support');
    expect(row?.components[0].adherence.notes).toContain(
      'automated axe-core returned incomplete results requiring review in 1 component(s)'
    );
  });

  it('reports mixed explicit axe outcomes as Partially Supports', async () => {
    await writeInput({
      ...report,
      components: [
        ...report.components,
        {
          name: 'atomic-result-list',
          storyCount: 1,
          automated: {
            violations: 0,
            passes: 1,
            incomplete: 0,
            inapplicable: 0,
            criteriaCovered: ['1.4.3'],
            criteriaViolated: [],
            criteriaPassed: ['1.4.3'],
            incompleteDetails: [],
          },
        },
      ],
    });

    const result = await transformJsonToOpenAcr({
      inputFile: path.join(dir, 'a11y-report.json'),
      outputFile: path.join(dir, 'openacr.yaml'),
      overridesFile: path.join(dir, 'no-overrides.json'),
      manualAuditDir: path.join(dir, 'no-manual'),
    });

    const row = result.chapters.success_criteria_level_aa.criteria.find(
      (criterion) => criterion.num === '1.4.3'
    );
    expect(row?.components[0].adherence.level).toBe('partially-supports');
    expect(row?.components[0].adherence.notes).toContain(
      'automated axe-core found violations in 1 component(s)'
    );
    expect(row?.components[0].adherence.notes).toContain(
      'automated axe-core passed checks across 1 component(s)'
    );
  });

  it('uses failed interactive evidence in OpenACR conformance', async () => {
    const emptyAutomated = {
      violations: 0,
      passes: 0,
      incomplete: 0,
      inapplicable: 0,
      criteriaCovered: [],
      criteriaViolated: [],
      criteriaPassed: [],
      incompleteDetails: [],
    };
    await writeInput({
      ...report,
      components: [
        ...report.components,
        {
          name: 'atomic-combobox',
          storyCount: 1,
          automated: emptyAutomated,
          interactive: {
            criteriaCovered: ['2.1.1', '2.1.2'],
            criteriaPassed: [],
            criteriaFailed: ['2.1.1', '2.1.2'],
            criteriaWarnings: [],
            testCount: 1,
            passedCount: 0,
          },
        },
        {
          name: 'atomic-dialog',
          storyCount: 1,
          automated: emptyAutomated,
          interactive: {
            criteriaCovered: ['2.1.1'],
            criteriaPassed: ['2.1.1'],
            criteriaFailed: [],
            criteriaWarnings: [],
            testCount: 1,
            passedCount: 1,
          },
        },
      ],
    });

    const result = await transformJsonToOpenAcr({
      inputFile: path.join(dir, 'a11y-report.json'),
      outputFile: path.join(dir, 'openacr.yaml'),
      overridesFile: path.join(dir, 'no-overrides.json'),
      manualAuditDir: path.join(dir, 'no-manual'),
    });

    const criteria = result.chapters.success_criteria_level_a.criteria;
    expect(levelOf(criteria, '2.1.1')).toBe('partially-supports');
    expect(levelOf(criteria, '2.1.2')).toBe('does-not-support');
    expect(
      criteria.find((criterion) => criterion.num === '2.1.2')?.components[0]
        .adherence.notes
    ).toContain('interactive keyboard testing failed across 1 component(s)');
  });

  it('lets an engineering override win over all signals', async () => {
    await writeInput();
    const overridesFile = path.join(dir, 'overrides.json');
    await writeFile(
      overridesFile,
      JSON.stringify({
        overrides: [
          {
            criterion: '1.4.3',
            conformance: 'supports',
            reason:
              'Design tokens meet AA; the axe finding is a false positive.',
          },
        ],
      })
    );

    const result = await transformJsonToOpenAcr({
      inputFile: path.join(dir, 'a11y-report.json'),
      outputFile: path.join(dir, 'openacr.yaml'),
      overridesFile,
      manualAuditDir: path.join(dir, 'no-manual'),
    });

    const aa = result.chapters.success_criteria_level_aa.criteria;
    const row = aa.find((c) => c.num === '1.4.3');
    expect(row?.components[0].adherence.level).toBe('supports');
    expect(row?.components[0].adherence.notes).toContain(
      'Design tokens meet AA'
    );
  });
});
