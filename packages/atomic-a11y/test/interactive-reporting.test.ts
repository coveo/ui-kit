import {describe, expect, it} from 'vitest';

import {buildA11yReport} from '../src/reporter/report-builder.js';
import type {ComponentAccumulator} from '../src/reporter/reporter-utils.js';
import {isInteractiveReport} from '../src/reporter/reporter-utils.js';
import {createSummary} from '../src/reporter/summary.js';
import type {
  A11yComponentReport,
  A11yCriterionReport,
} from '../src/shared/types.js';

describe('isInteractiveReport', () => {
  it('accepts well-formed interactive reports', () => {
    const report = {
      type: 'a11y-interactive',
      version: 1,
      status: 'passed',
      result: {criteriaCovered: ['2.1.1']},
    };

    expect(isInteractiveReport(report)).toBe(true);
  });

  it('rejects malformed interactive reports', () => {
    for (const report of [
      {
        type: 'a11y-interactive',
        status: 'passed',
        result: {criteriaCovered: ['2.1.1']},
      },
      {
        type: 'a11y-interactive',
        version: 1,
        status: 'unknown',
        result: {criteriaCovered: ['2.1.1']},
      },
      {
        type: 'a11y-interactive',
        version: 1,
        status: 'passed',
        result: {criteriaCovered: [1]},
      },
    ]) {
      expect(isInteractiveReport(report)).toBe(false);
    }
  });
});

describe('interactive report aggregation', () => {
  it('does not duplicate covered components covered by automated and interactive results', () => {
    const componentResults = new Map<string, ComponentAccumulator>([
      [
        'atomic-result-list',
        {
          name: 'atomic-result-list',
          storyIds: new Set(['default']),
          automated: {
            violations: 0,
            passes: 1,
            incomplete: 0,
            inapplicable: 0,
            criteriaCovered: new Set(['2.1.1']),
            criteriaViolated: new Set(),
            criteriaPassed: new Set(['2.1.1']),
            incompleteDetails: [],
          },
          interactive: {
            criteriaCovered: new Set(['2.1.1']),
            testCount: 1,
            passedCount: 1,
            passedCriteria: new Set(['2.1.1']),
            failedCriteria: new Set(),
            warningCriteria: new Set(),
          },
        },
      ],
    ]);

    const report = buildA11yReport(componentResults, {
      version: '1.0.0',
      devDependencies: {'axe-core': '4.10.3', storybook: '10.3.5'},
    });

    expect(report.criteria[0].coveredComponents).toEqual([
      'atomic-result-list',
    ]);
  });

  it('preserves mixed interactive outcomes as partial conformance', () => {
    const emptyAutomated = {
      violations: 0,
      passes: 0,
      incomplete: 0,
      inapplicable: 0,
      criteriaCovered: new Set<string>(),
      criteriaViolated: new Set<string>(),
      criteriaPassed: new Set<string>(),
      incompleteDetails: [],
    };
    const componentResults = new Map<string, ComponentAccumulator>([
      [
        'atomic-dialog',
        {
          name: 'atomic-dialog',
          storyIds: new Set(['default']),
          automated: {...emptyAutomated},
          interactive: {
            criteriaCovered: new Set(['2.1.1']),
            testCount: 1,
            passedCount: 1,
            passedCriteria: new Set(['2.1.1']),
            failedCriteria: new Set(),
            warningCriteria: new Set(),
          },
        },
      ],
      [
        'atomic-combobox',
        {
          name: 'atomic-combobox',
          storyIds: new Set(['default']),
          automated: {...emptyAutomated},
          interactive: {
            criteriaCovered: new Set(['2.1.1', '2.1.2']),
            testCount: 1,
            passedCount: 0,
            passedCriteria: new Set(),
            failedCriteria: new Set(['2.1.1', '2.1.2']),
            warningCriteria: new Set(),
          },
        },
      ],
    ]);

    const report = buildA11yReport(componentResults, {
      version: '1.0.0',
      devDependencies: {'axe-core': '4.10.3', storybook: '10.3.5'},
    });

    expect(report.components[0].interactive?.criteriaFailed).toEqual([
      '2.1.1',
      '2.1.2',
    ]);
    expect(report.components[1].interactive?.criteriaPassed).toEqual(['2.1.1']);
    expect(report.criteria[0]).toMatchObject({
      conformance: 'partiallySupports',
      interactiveStatus: 'partiallyPassed',
      coveredComponents: ['atomic-combobox', 'atomic-dialog'],
      violatingComponents: ['atomic-combobox'],
    });
    expect(report.criteria[1]).toMatchObject({
      id: '2.1.2',
      conformance: 'doesNotSupport',
      interactiveStatus: 'failed',
      coveredComponents: ['atomic-combobox'],
      violatingComponents: ['atomic-combobox'],
    });
  });

  it('excludes warning-only criteria from interactive pass rate', () => {
    const components: A11yComponentReport[] = [];
    const criteria: A11yCriterionReport[] = [
      {
        id: '2.1.1',
        name: 'Keyboard',
        level: 'A',
        wcagVersion: '2.2',
        conformance: 'doesNotSupport',
        automatedCoverage: false,
        interactiveCoverage: true,
        interactiveStatus: 'passed',
        manualVerified: false,
        coveredComponents: [],
        violatingComponents: [],
      },
      {
        id: '2.1.2',
        name: 'No Keyboard Trap',
        level: 'A',
        wcagVersion: '2.2',
        conformance: 'doesNotSupport',
        automatedCoverage: false,
        interactiveCoverage: true,
        manualVerified: false,
        coveredComponents: [],
        violatingComponents: [],
      },
    ];

    expect(createSummary(components, criteria).interactivePassRate).toBe(
      '100%'
    );
  });
});
