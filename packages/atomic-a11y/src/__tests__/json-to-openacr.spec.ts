import {mkdir, mkdtemp, readFile, rm, writeFile} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {describe, expect, it} from 'vitest';
import {buildRemarks, resolveConformance} from '../openacr/conformance.js';
import {transformJsonToOpenAcr} from '../openacr/json-to-openacr.js';
import {
  isValidManualBaselineEntry,
  loadManualAuditData,
  parseManualBaseline,
  resolveManualConformance,
} from '../openacr/manual-audit.js';
import type {A11yReport} from '../shared/types.js';

async function createTempDirectory(prefix: string): Promise<string> {
  return mkdtemp(path.join(os.tmpdir(), `atomic-a11y-${prefix}-`));
}

function createInputReport(): A11yReport {
  return {
    report: {
      product: 'Coveo Atomic',
      version: '3.0.0',
      standard: 'WCAG 2.2 AA',
      reportDate: '2025-02-14',
      evaluationMethods: ['axe-core 4.10.3'],
      axeCoreVersion: '4.10.3',
      storybookVersion: '10.0.8',
    },
    components: [
      {
        name: 'atomic-search-box',
        category: 'search',
        framework: 'lit',
        storyCount: 1,
        automated: {
          violations: 0,
          passes: 1,
          incomplete: 0,
          inapplicable: 0,
          criteriaCovered: ['1.1.1'],
          incompleteDetails: [],
        },
      },
    ],
    criteria: [
      {
        id: '1.1.1',
        name: 'Non-text Content',
        level: 'A',
        wcagVersion: '2.0',
        conformance: 'notEvaluated',
        automatedCoverage: true,
        manualVerified: false,
        remarks: '',
        affectedComponents: ['atomic-search-box'],
      },
    ],
    summary: {
      totalComponents: 1,
      litComponents: 1,
      stencilComponents: 0,
      stencilExcluded: true,
      storyCoverage: {
        total: 1,
        withA11y: 1,
        excludedFromA11y: 0,
      },
      totalCriteria: 50,
      supports: 0,
      partiallySupports: 0,
      doesNotSupport: 0,
      notApplicable: 0,
      notEvaluated: 50,
      automatedCoverage: '2%',
      manualCoverage: '0%',
    },
  };
}

describe('json-to-openacr conversion', () => {
  it('converts a11y report JSON into OpenACR output and YAML file', async () => {
    const tempDir = await createTempDirectory('openacr-conversion');
    const inputPath = path.join(tempDir, 'a11y-report.json');
    const outputPath = path.join(tempDir, 'openacr.yaml');
    const overridesPath = path.join(tempDir, 'a11y-overrides.json');

    try {
      await writeFile(
        inputPath,
        `${JSON.stringify(createInputReport(), null, 2)}\n`
      );
      await writeFile(overridesPath, '{"overrides": []}\n');

      const result = await transformJsonToOpenAcr({
        inputFile: inputPath,
        outputFile: outputPath,
        overridesFile: overridesPath,
      });

      const yamlContent = await readFile(outputPath, 'utf8');

      expect(result.summary.total_criteria).toBeGreaterThan(0);
      expect(result.summary.automated_covered_criteria).toBeGreaterThan(0);
      expect(
        result.chapters.success_criteria_level_a.criteria.length
      ).toBeGreaterThan(0);
      expect(yamlContent).toContain(
        'title: Coveo Accessibility Conformance Report'
      );
      expect(yamlContent).toContain('summary:');
      expect(yamlContent).toContain('chapters:');
    } finally {
      await rm(tempDir, {recursive: true, force: true});
    }
  });
});

describe('json-to-openacr manual baseline pipeline', () => {
  it('isValidManualBaselineEntry() validates required structure', () => {
    const validEntry = {
      name: 'atomic-search-box',
      category: 'search',
      manual: {
        status: 'complete',
        wcag22Criteria: {
          '1.1.1-non-text-content': 'pass',
        },
      },
    };

    const invalidEntry = {
      name: '',
      manual: {
        status: 'complete',
      },
    };

    expect(isValidManualBaselineEntry(validEntry)).toBe(true);
    expect(isValidManualBaselineEntry(invalidEntry)).toBe(false);
  });

  it('parseManualBaseline() parses completed manual baseline entries', () => {
    const content = JSON.stringify([
      {
        name: 'atomic-search-box',
        category: 'search',
        manual: {
          status: 'complete',
          wcag22Criteria: {
            '1.1.1-non-text-content': 'pass',
            '1.3.1-info-and-relationships': 'partial',
          },
        },
      },
      {
        name: 'atomic-result-list',
        category: 'search',
        manual: {
          status: 'pending',
          wcag22Criteria: {
            '1.1.1-non-text-content': 'fail',
          },
        },
      },
    ]);

    const parsed = parseManualBaseline(
      content,
      '/tmp/manual-audit-search.json'
    );

    expect(parsed.size).toBe(2);
    expect(parsed.get('atomic-search-box:1.1.1')?.[0].conformance).toBe(
      'supports'
    );
    expect(parsed.get('atomic-search-box:1.3.1')?.[0].conformance).toBe(
      'partially-supports'
    );
    expect(parsed.has('atomic-result-list:1.1.1')).toBe(false);
  });

  it('loadManualAuditData() reads and aggregates baseline files', async () => {
    const tempDir = await createTempDirectory('manual-baselines');

    try {
      await mkdir(tempDir, {recursive: true});
      await writeFile(
        path.join(tempDir, 'manual-audit-commerce.json'),
        JSON.stringify([
          {
            name: 'atomic-product',
            category: 'commerce',
            manual: {
              status: 'complete',
              wcag22Criteria: {
                '2.4.1-bypass-blocks': 'not-applicable',
              },
            },
          },
        ])
      );
      await writeFile(
        path.join(tempDir, 'manual-audit-commerce-violations.json'),
        JSON.stringify([])
      );

      const aggregates = await loadManualAuditData(tempDir);

      expect(aggregates.size).toBe(1);
      expect(aggregates.get('atomic-product:2.4.1')?.[0].conformance).toBe(
        'not-applicable'
      );
    } finally {
      await rm(tempDir, {recursive: true, force: true});
    }
  });

  it('resolveManualConformance() applies fail > partial > pass > not-applicable precedence', () => {
    expect(
      resolveManualConformance([
        {componentName: 'a', criterionId: '1.1.1', conformance: 'supports'},
        {
          componentName: 'b',
          criterionId: '1.1.1',
          conformance: 'does-not-support',
        },
      ])
    ).toBe('does-not-support');

    expect(
      resolveManualConformance([
        {
          componentName: 'a',
          criterionId: '1.1.1',
          conformance: 'partially-supports',
        },
        {componentName: 'b', criterionId: '1.1.1', conformance: 'supports'},
      ])
    ).toBe('partially-supports');

    expect(
      resolveManualConformance([
        {
          componentName: 'a',
          criterionId: '1.1.1',
          conformance: 'not-applicable',
        },
      ])
    ).toBe('not-applicable');
  });

  it('resolveConformance() applies override > manual > automated precedence', () => {
    expect(
      resolveConformance(
        undefined,
        {
          coveredComponents: new Set(['atomic-search-box']),
          violatingComponents: new Set(['atomic-search-box']),
        },
        [
          {
            componentName: 'atomic-search-box',
            criterionId: '1.1.1',
            conformance: 'supports',
          },
        ],
        {
          criterion: '1.1.1',
          conformance: 'not-applicable',
          reason: 'Overridden by policy',
        }
      )
    ).toBe('not-applicable');

    expect(
      resolveConformance(
        undefined,
        {
          coveredComponents: new Set(['atomic-search-box']),
          violatingComponents: new Set(['atomic-search-box']),
        },
        [
          {
            componentName: 'atomic-search-box',
            criterionId: '1.1.1',
            conformance: 'supports',
          },
        ],
        undefined
      )
    ).toBe('supports');

    expect(
      resolveConformance(
        undefined,
        {
          coveredComponents: new Set(['atomic-search-box']),
          violatingComponents: new Set(['atomic-search-box']),
        },
        undefined,
        undefined
      )
    ).toBe('does-not-support');
  });

  it('buildRemarks() generates manual audit summaries when manual aggregates exist', () => {
    const remarks = buildRemarks(
      '1.1.1',
      'partially-supports',
      ['atomic-search-box', 'atomic-result-list'],
      ['atomic-result-list'],
      [
        {
          componentName: 'atomic-search-box',
          criterionId: '1.1.1',
          conformance: 'supports',
        },
        {
          componentName: 'atomic-result-list',
          criterionId: '1.1.1',
          conformance: 'does-not-support',
        },
      ],
      undefined
    );

    expect(remarks).toContain('Manual audit:');
    expect(remarks).toContain('1 pass');
    expect(remarks).toContain('1 fail');
    expect(remarks).toContain('across 2 component(s).');
  });
});
