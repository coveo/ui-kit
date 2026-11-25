import {mkdtemp, readFile, rm, writeFile} from 'node:fs/promises';
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

  const writeInput = () => writeFile(path.join(dir, 'a11y-report.json'), JSON.stringify(report));

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

  it('uses the generated dates when there is no committed report', async () => {
    await writeInput();

    const result = await transformJsonToOpenAcr({
      inputFile: path.join(dir, 'a11y-report.json'),
      outputFile: path.join(dir, 'openacr.yaml'),
      overridesFile: path.join(dir, 'no-overrides.json'),
      manualAuditDir: path.join(dir, 'no-manual'),
      baselineFile: path.join(dir, 'missing.yaml'),
    });

    expect(result.report_date).toBe('2026-01-01');
  });

  it('rejects a report generated for another Atomic version', async () => {
    await writeInput();

    await expect(
      transformJsonToOpenAcr({
        inputFile: path.join(dir, 'a11y-report.json'),
        outputFile: path.join(dir, 'openacr.yaml'),
        overridesFile: path.join(dir, 'no-overrides.json'),
        manualAuditDir: path.join(dir, 'no-manual'),
        expectedVersion: '3.1.0',
      })
    ).rejects.toThrow(/generated for Atomic 3.0.0, but @coveo\/atomic is 3.1.0/);
  });

  describe('when regenerating over a committed report', () => {
    const today = new Date().toISOString().slice(0, 10);
    const outputFile = () => path.join(dir, 'openacr.yaml');
    const generate = () =>
      transformJsonToOpenAcr({
        inputFile: path.join(dir, 'a11y-report.json'),
        outputFile: outputFile(),
        overridesFile: path.join(dir, 'no-overrides.json'),
        manualAuditDir: path.join(dir, 'no-manual'),
      });

    // Commit a report generated from the default input, last modified on 2026-01-05.
    beforeEach(async () => {
      await writeInput();
      await generate();
      const committed = await readFile(outputFile(), 'utf8');
      await writeFile(
        outputFile(),
        committed.replace(/^last_modified_date: .*$/m, "last_modified_date: '2026-01-05'")
      );
    });

    it('fails when the committed report cannot be parsed', async () => {
      await writeFile(outputFile(), 'product: [unclosed\n');

      await expect(generate()).rejects.toThrow(/Could not parse the OpenACR report/);
    });

    it('fails when the committed report has no dates', async () => {
      await writeFile(outputFile(), "title: 'Coveo Accessibility Conformance Report'\n");

      await expect(generate()).rejects.toThrow(/has no report_date or last_modified_date/);
    });

    it('keeps both dates when nothing changed', async () => {
      const result = await generate();

      expect(result.report_date).toBe('2026-01-01');
      expect(result.last_modified_date).toBe('2026-01-05');
    });

    it('keeps report_date but updates last_modified_date for a new Atomic version only', async () => {
      await writeFile(
        path.join(dir, 'a11y-report.json'),
        JSON.stringify({
          ...report,
          report: {...report.report, version: '3.1.0', reportDate: '2026-02-02'},
        })
      );

      const result = await generate();

      expect(result.product.version).toBe('3.1.0');
      expect(result.report_date).toBe('2026-01-01');
      expect(result.last_modified_date).toBe(today);
    });
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
            reason: 'Design tokens meet AA; the axe finding is a false positive.',
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
    expect(row?.components[0].adherence.notes).toContain('Design tokens meet AA');
  });
});
