import {mkdtemp, readFile, rm, writeFile} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {describe, expect, it} from 'vitest';
import {transformJsonToOpenAcr} from '../openacr/json-to-openacr.js';
import type {
  A11yComponentReport,
  A11yCriterionReport,
  A11yReport,
} from '../shared/types.js';

async function createTempDirectory(prefix: string): Promise<string> {
  return mkdtemp(path.join(os.tmpdir(), `atomic-a11y-${prefix}-`));
}

function createMockComponent(
  overrides: Partial<A11yComponentReport> = {}
): A11yComponentReport {
  return {
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
    ...overrides,
  };
}

function createMockCriterion(
  overrides: Partial<A11yCriterionReport> = {}
): A11yCriterionReport {
  return {
    id: '1.1.1',
    name: 'Non-text Content',
    level: 'A',
    wcagVersion: '2.0',
    conformance: 'notEvaluated',
    automatedCoverage: true,
    manualVerified: false,
    remarks: '',
    affectedComponents: ['atomic-search-box'],
    ...overrides,
  };
}

function createMockReport(): A11yReport {
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
    components: [createMockComponent()],
    criteria: [createMockCriterion()],
    summary: {
      totalComponents: 1,
      litComponents: 1,
      stencilComponents: 0,
      stencilExcluded: true,
      storyCoverage: {total: 1, withA11y: 1, excludedFromA11y: 0},
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

describe('transformJsonToOpenAcr()', () => {
  it('should convert a11y report JSON into OpenACR YAML output', async () => {
    const tempDir = await createTempDirectory('openacr-conversion');
    const inputPath = path.join(tempDir, 'a11y-report.json');
    const outputPath = path.join(tempDir, 'openacr.yaml');
    const overridesPath = path.join(tempDir, 'a11y-overrides.json');

    try {
      await writeFile(
        inputPath,
        `${JSON.stringify(createMockReport(), null, 2)}\n`
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

  it('should produce valid report when input file does not exist', async () => {
    const tempDir = await createTempDirectory('openacr-no-input');
    const outputPath = path.join(tempDir, 'openacr.yaml');
    const overridesPath = path.join(tempDir, 'a11y-overrides.json');

    try {
      await writeFile(overridesPath, '{"overrides": []}\n');

      const result = await transformJsonToOpenAcr({
        inputFile: path.join(tempDir, 'nonexistent.json'),
        outputFile: outputPath,
        overridesFile: overridesPath,
      });

      expect(result.title).toBe('Coveo Accessibility Conformance Report');
      expect(result.product.name).toBe('Coveo Atomic');
      expect(result.summary.total_criteria).toBeGreaterThan(0);
      expect(result.summary.automated_covered_criteria).toBe(0);
    } finally {
      await rm(tempDir, {recursive: true, force: true});
    }
  });

  it('should produce valid report when overrides file does not exist', async () => {
    const tempDir = await createTempDirectory('openacr-no-overrides');
    const inputPath = path.join(tempDir, 'a11y-report.json');
    const outputPath = path.join(tempDir, 'openacr.yaml');

    try {
      await writeFile(
        inputPath,
        `${JSON.stringify(createMockReport(), null, 2)}\n`
      );

      const result = await transformJsonToOpenAcr({
        inputFile: inputPath,
        outputFile: outputPath,
        overridesFile: path.join(tempDir, 'nonexistent-overrides.json'),
      });

      expect(result.summary.total_criteria).toBeGreaterThan(0);
    } finally {
      await rm(tempDir, {recursive: true, force: true});
    }
  });

  it('should apply overrides to output criteria', async () => {
    const tempDir = await createTempDirectory('openacr-with-overrides');
    const inputPath = path.join(tempDir, 'a11y-report.json');
    const outputPath = path.join(tempDir, 'openacr.yaml');
    const overridesPath = path.join(tempDir, 'a11y-overrides.json');

    try {
      await writeFile(
        inputPath,
        `${JSON.stringify(createMockReport(), null, 2)}\n`
      );
      await writeFile(
        overridesPath,
        JSON.stringify({
          overrides: [
            {
              criterion: '1.1.1',
              conformance: 'not-applicable',
              reason: 'Not relevant for product scope',
            },
          ],
        })
      );

      const result = await transformJsonToOpenAcr({
        inputFile: inputPath,
        outputFile: outputPath,
        overridesFile: overridesPath,
      });

      const allCriteria = [
        ...result.chapters.success_criteria_level_a.criteria,
        ...result.chapters.success_criteria_level_aa.criteria,
      ];
      const overriddenCriterion = allCriteria.find((c) => c.num === '1.1.1');

      expect(overriddenCriterion?.conformance).toBe('not-applicable');
      expect(overriddenCriterion?.remarks).toContain('[Override]');
    } finally {
      await rm(tempDir, {recursive: true, force: true});
    }
  });

  it('should write YAML output to the specified file', async () => {
    const tempDir = await createTempDirectory('openacr-yaml-write');
    const inputPath = path.join(tempDir, 'a11y-report.json');
    const outputPath = path.join(tempDir, 'output', 'openacr.yaml');
    const overridesPath = path.join(tempDir, 'a11y-overrides.json');

    try {
      await writeFile(
        inputPath,
        `${JSON.stringify(createMockReport(), null, 2)}\n`
      );
      await writeFile(overridesPath, '{"overrides": []}\n');

      await transformJsonToOpenAcr({
        inputFile: inputPath,
        outputFile: outputPath,
        overridesFile: overridesPath,
      });

      const yamlContent = await readFile(outputPath, 'utf8');

      expect(yamlContent.length).toBeGreaterThan(0);
      expect(yamlContent).toContain('title:');
      expect(yamlContent).toContain('product:');
    } finally {
      await rm(tempDir, {recursive: true, force: true});
    }
  });
});
