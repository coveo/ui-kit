import {describe, expect, it} from 'vitest';
import {buildA11yReport} from '../reporter/report-builder.js';
import type {
  ComponentAccumulator,
  PackageMetadata,
} from '../reporter/reporter-utils.js';

function createMockComponentAccumulator(
  name: string,
  category: string,
  framework: 'lit' | 'stencil' = 'lit',
  criteriaCovered: string[] = []
): ComponentAccumulator {
  return {
    name,
    category,
    framework,
    storyIds: new Set([`${category}-${name}--default`]),
    automated: {
      violations: 0,
      passes: 0,
      incomplete: 0,
      inapplicable: 0,
      criteriaCovered: new Set(criteriaCovered),
      incompleteDetails: [],
    },
  };
}

function createMockPackageMetadata(
  axeCoreVersion = '4.10.0',
  storybookVersion = '8.0.0',
  version = '3.1.0'
): PackageMetadata {
  return {
    version,
    devDependencies: {
      'axe-core': axeCoreVersion,
      storybook: storybookVersion,
    },
  };
}

describe('buildA11yReport', () => {
  it('should build well-formed A11yReport with valid inputs', () => {
    const componentResults = new Map<string, ComponentAccumulator>();
    componentResults.set(
      'atomic-search-box',
      createMockComponentAccumulator('atomic-search-box', 'search', 'lit', [
        '1.4.3',
        '4.1.2',
      ])
    );

    const report = buildA11yReport(
      componentResults,
      55,
      createMockPackageMetadata()
    );

    expect(report.report.product).toBe('Coveo Atomic');
    expect(report.report.standard).toBe('WCAG 2.2 AA');
    expect(report.report.version).toBe('3.1.0');
    expect(report.report.reportDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(report.report.evaluationMethods).toContain('Manual audit');
    expect(report.report.evaluationMethods).toContain('axe-core 4.10.0');
    expect(report.report.evaluationMethods).toContain('Storybook addon-a11y');
    expect(report.report.axeCoreVersion).toBe('4.10.0');
    expect(report.report.storybookVersion).toBe('8.0.0');

    expect(report.components).toHaveLength(1);
    expect(report.components[0].name).toBe('atomic-search-box');
    expect(report.components[0].category).toBe('search');
    expect(report.components[0].framework).toBe('lit');

    expect(report.criteria).toHaveLength(2);
    expect(report.criteria.map((c) => c.id)).toEqual(['1.4.3', '4.1.2']);

    expect(report.summary).toBeDefined();
    expect(report.summary.totalComponents).toBe(1);
  });

  it('should sort multiple components alphabetically', () => {
    const componentResults = new Map<string, ComponentAccumulator>();
    componentResults.set(
      'atomic-result-list',
      createMockComponentAccumulator('atomic-result-list', 'search', 'lit')
    );
    componentResults.set(
      'atomic-search-box',
      createMockComponentAccumulator('atomic-search-box', 'search', 'lit')
    );
    componentResults.set(
      'atomic-facet',
      createMockComponentAccumulator('atomic-facet', 'search', 'lit')
    );

    const report = buildA11yReport(
      componentResults,
      55,
      createMockPackageMetadata()
    );

    expect(report.components).toHaveLength(3);
    expect(report.components.map((c) => c.name)).toEqual([
      'atomic-facet',
      'atomic-result-list',
      'atomic-search-box',
    ]);
    expect(report.summary.totalComponents).toBe(3);
  });

  it('should deduplicate criteria and include all affected components', () => {
    const componentResults = new Map<string, ComponentAccumulator>();
    componentResults.set(
      'atomic-search-box',
      createMockComponentAccumulator('atomic-search-box', 'search', 'lit', [
        '1.4.3',
        '4.1.2',
      ])
    );
    componentResults.set(
      'atomic-facet',
      createMockComponentAccumulator('atomic-facet', 'search', 'lit', [
        '1.4.3',
        '2.4.7',
      ])
    );

    const report = buildA11yReport(
      componentResults,
      55,
      createMockPackageMetadata()
    );

    expect(report.criteria).toHaveLength(3);
    const criterion143 = report.criteria.find((c) => c.id === '1.4.3');
    expect(criterion143).toBeDefined();
    expect(criterion143?.affectedComponents).toEqual([
      'atomic-facet',
      'atomic-search-box',
    ]);
    expect(criterion143?.automatedCoverage).toBe(true);
    expect(criterion143?.manualVerified).toBe(false);
    expect(criterion143?.conformance).toBe('notEvaluated');

    const criterion412 = report.criteria.find((c) => c.id === '4.1.2');
    expect(criterion412?.affectedComponents).toEqual(['atomic-search-box']);

    const criterion247 = report.criteria.find((c) => c.id === '2.4.7');
    expect(criterion247?.affectedComponents).toEqual(['atomic-facet']);
  });

  it('should sort criteria by numeric ID', () => {
    const componentResults = new Map<string, ComponentAccumulator>();
    componentResults.set(
      'atomic-search-box',
      createMockComponentAccumulator('atomic-search-box', 'search', 'lit', [
        '4.1.2',
        '1.4.3',
        '2.4.7',
        '1.1.1',
      ])
    );

    const report = buildA11yReport(
      componentResults,
      55,
      createMockPackageMetadata()
    );

    expect(report.criteria.map((c) => c.id)).toEqual([
      '1.1.1',
      '1.4.3',
      '2.4.7',
      '4.1.2',
    ]);
  });

  it('should throw error when axe-core version is missing', () => {
    const componentResults = new Map<string, ComponentAccumulator>();
    componentResults.set(
      'atomic-search-box',
      createMockComponentAccumulator('atomic-search-box', 'search')
    );

    const metadata: PackageMetadata = {
      version: '3.1.0',
      devDependencies: {
        storybook: '8.0.0',
      },
    };

    expect(() => buildA11yReport(componentResults, 55, metadata)).toThrow(
      'axe-core version not found in package metadata'
    );
  });

  it('should throw error when storybook version is missing', () => {
    const componentResults = new Map<string, ComponentAccumulator>();
    componentResults.set(
      'atomic-search-box',
      createMockComponentAccumulator('atomic-search-box', 'search')
    );

    const metadata: PackageMetadata = {
      version: '3.1.0',
      devDependencies: {
        'axe-core': '4.10.0',
      },
    };

    expect(() => buildA11yReport(componentResults, 55, metadata)).toThrow(
      'storybook version not found in package metadata'
    );
  });

  it('should handle empty componentResults map', () => {
    const componentResults = new Map<string, ComponentAccumulator>();

    const report = buildA11yReport(
      componentResults,
      55,
      createMockPackageMetadata()
    );

    expect(report.components).toHaveLength(0);
    expect(report.criteria).toHaveLength(0);
    expect(report.summary.totalComponents).toBe(0);
    expect(report.report.product).toBe('Coveo Atomic');
    expect(report.report.standard).toBe('WCAG 2.2 AA');
  });

  it('should pick up axe-core from devDependencies', () => {
    const componentResults = new Map<string, ComponentAccumulator>();
    componentResults.set(
      'atomic-search-box',
      createMockComponentAccumulator('atomic-search-box', 'search')
    );

    const metadata: PackageMetadata = {
      version: '3.1.0',
      devDependencies: {
        'axe-core': '4.11.0',
        storybook: '8.1.0',
      },
    };

    const report = buildA11yReport(componentResults, 55, metadata);

    expect(report.report.axeCoreVersion).toBe('4.11.0');
    expect(report.report.evaluationMethods).toContain('axe-core 4.11.0');
  });

  it('should pick up axe-core from dependencies when not in devDependencies', () => {
    const componentResults = new Map<string, ComponentAccumulator>();
    componentResults.set(
      'atomic-search-box',
      createMockComponentAccumulator('atomic-search-box', 'search')
    );

    const metadata: PackageMetadata = {
      version: '3.1.0',
      dependencies: {
        'axe-core': '4.12.0',
        storybook: '8.2.0',
      },
    };

    const report = buildA11yReport(componentResults, 55, metadata);

    expect(report.report.axeCoreVersion).toBe('4.12.0');
    expect(report.report.storybookVersion).toBe('8.2.0');
    expect(report.report.evaluationMethods).toContain('axe-core 4.12.0');
  });

  it('should use version 3.x.x when version is missing from metadata', () => {
    const componentResults = new Map<string, ComponentAccumulator>();
    componentResults.set(
      'atomic-search-box',
      createMockComponentAccumulator('atomic-search-box', 'search')
    );

    const metadata: PackageMetadata = {
      devDependencies: {
        'axe-core': '4.10.0',
        storybook: '8.0.0',
      },
    };

    const report = buildA11yReport(componentResults, 55, metadata);

    expect(report.report.version).toBe('3.x.x');
  });
});
