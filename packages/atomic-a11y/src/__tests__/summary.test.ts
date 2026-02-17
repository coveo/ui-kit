import {describe, expect, it} from 'vitest';
import {createSummary} from '../reporter/summary.js';
import type {
  A11yComponentReport,
  A11yCriterionReport,
} from '../shared/types.js';

describe('createSummary', () => {
  describe('component framework counts', () => {
    it('should count lit-only components correctly', () => {
      const components: A11yComponentReport[] = [
        {
          name: 'atomic-button',
          category: 'common',
          framework: 'lit',
          storyCount: 2,
          automated: {
            violations: 0,
            passes: 5,
            incomplete: 0,
            inapplicable: 0,
            criteriaCovered: [],
            incompleteDetails: [],
          },
        },
        {
          name: 'atomic-link',
          category: 'common',
          framework: 'lit',
          storyCount: 1,
          automated: {
            violations: 0,
            passes: 3,
            incomplete: 0,
            inapplicable: 0,
            criteriaCovered: [],
            incompleteDetails: [],
          },
        },
      ];
      const summary = createSummary(components, [], 55);

      expect(summary.litComponents).toBe(2);
      expect(summary.stencilComponents).toBe(0);
      expect(summary.totalComponents).toBe(2);
    });

    it('should count stencil-only components correctly', () => {
      const components: A11yComponentReport[] = [
        {
          name: 'atomic-search',
          category: 'search',
          framework: 'stencil',
          storyCount: 3,
          automated: {
            violations: 0,
            passes: 10,
            incomplete: 0,
            inapplicable: 0,
            criteriaCovered: [],
            incompleteDetails: [],
          },
        },
      ];
      const summary = createSummary(components, [], 55);

      expect(summary.litComponents).toBe(0);
      expect(summary.stencilComponents).toBe(1);
      expect(summary.totalComponents).toBe(1);
    });

    it('should count mixed framework components correctly', () => {
      const components: A11yComponentReport[] = [
        {
          name: 'atomic-button',
          category: 'common',
          framework: 'lit',
          storyCount: 2,
          automated: {
            violations: 0,
            passes: 5,
            incomplete: 0,
            inapplicable: 0,
            criteriaCovered: [],
            incompleteDetails: [],
          },
        },
        {
          name: 'atomic-search',
          category: 'search',
          framework: 'stencil',
          storyCount: 3,
          automated: {
            violations: 0,
            passes: 10,
            incomplete: 0,
            inapplicable: 0,
            criteriaCovered: [],
            incompleteDetails: [],
          },
        },
        {
          name: 'atomic-icon',
          category: 'common',
          framework: 'lit',
          storyCount: 1,
          automated: {
            violations: 0,
            passes: 2,
            incomplete: 0,
            inapplicable: 0,
            criteriaCovered: [],
            incompleteDetails: [],
          },
        },
      ];
      const summary = createSummary(components, [], 55);

      expect(summary.litComponents).toBe(2);
      expect(summary.stencilComponents).toBe(1);
      expect(summary.totalComponents).toBe(3);
    });
  });

  describe('stencil exclusion flag', () => {
    it('should always set stencilExcluded to true', () => {
      const components: A11yComponentReport[] = [];
      const summary = createSummary(components, [], 55);

      expect(summary.stencilExcluded).toBe(true);
    });

    it('should set stencilExcluded to true even with stencil components', () => {
      const components: A11yComponentReport[] = [
        {
          name: 'atomic-search',
          category: 'search',
          framework: 'stencil',
          storyCount: 3,
          automated: {
            violations: 0,
            passes: 10,
            incomplete: 0,
            inapplicable: 0,
            criteriaCovered: [],
            incompleteDetails: [],
          },
        },
      ];
      const summary = createSummary(components, [], 55);

      expect(summary.stencilExcluded).toBe(true);
    });
  });

  describe('story coverage', () => {
    it('should sum all component storyCount values for total', () => {
      const components: A11yComponentReport[] = [
        {
          name: 'atomic-button',
          category: 'common',
          framework: 'lit',
          storyCount: 2,
          automated: {
            violations: 0,
            passes: 5,
            incomplete: 0,
            inapplicable: 0,
            criteriaCovered: [],
            incompleteDetails: [],
          },
        },
        {
          name: 'atomic-link',
          category: 'common',
          framework: 'lit',
          storyCount: 3,
          automated: {
            violations: 0,
            passes: 5,
            incomplete: 0,
            inapplicable: 0,
            criteriaCovered: [],
            incompleteDetails: [],
          },
        },
        {
          name: 'atomic-search',
          category: 'search',
          framework: 'stencil',
          storyCount: 5,
          automated: {
            violations: 0,
            passes: 10,
            incomplete: 0,
            inapplicable: 0,
            criteriaCovered: [],
            incompleteDetails: [],
          },
        },
      ];
      const summary = createSummary(components, [], 55);

      expect(summary.storyCoverage.total).toBe(10);
    });

    it('should set withA11y equal to total', () => {
      const components: A11yComponentReport[] = [
        {
          name: 'atomic-button',
          category: 'common',
          framework: 'lit',
          storyCount: 4,
          automated: {
            violations: 0,
            passes: 5,
            incomplete: 0,
            inapplicable: 0,
            criteriaCovered: [],
            incompleteDetails: [],
          },
        },
      ];
      const summary = createSummary(components, [], 55);

      expect(summary.storyCoverage.withA11y).toBe(4);
      expect(summary.storyCoverage.withA11y).toBe(summary.storyCoverage.total);
    });

    it('should set excludedFromA11y to 0', () => {
      const components: A11yComponentReport[] = [
        {
          name: 'atomic-button',
          category: 'common',
          framework: 'lit',
          storyCount: 2,
          automated: {
            violations: 0,
            passes: 5,
            incomplete: 0,
            inapplicable: 0,
            criteriaCovered: [],
            incompleteDetails: [],
          },
        },
      ];
      const summary = createSummary(components, [], 55);

      expect(summary.storyCoverage.excludedFromA11y).toBe(0);
    });

    it('should handle zero stories', () => {
      const components: A11yComponentReport[] = [];
      const summary = createSummary(components, [], 55);

      expect(summary.storyCoverage.total).toBe(0);
      expect(summary.storyCoverage.withA11y).toBe(0);
      expect(summary.storyCoverage.excludedFromA11y).toBe(0);
    });
  });

  describe('criteria counts', () => {
    it('should set notEvaluated equal to totalCriteria parameter', () => {
      const components: A11yComponentReport[] = [];
      const summary = createSummary(components, [], 55);

      expect(summary.notEvaluated).toBe(55);
    });

    it('should set conformance counts to 0', () => {
      const components: A11yComponentReport[] = [
        {
          name: 'atomic-button',
          category: 'common',
          framework: 'lit',
          storyCount: 2,
          automated: {
            violations: 0,
            passes: 5,
            incomplete: 0,
            inapplicable: 0,
            criteriaCovered: [],
            incompleteDetails: [],
          },
        },
      ];
      const criteria: A11yCriterionReport[] = [];
      const summary = createSummary(components, criteria, 55);

      expect(summary.supports).toBe(0);
      expect(summary.partiallySupports).toBe(0);
      expect(summary.doesNotSupport).toBe(0);
      expect(summary.notApplicable).toBe(0);
    });
  });

  describe('coverage percentages', () => {
    it('should calculate automatedCoverage as percentage', () => {
      const components: A11yComponentReport[] = [];
      const criteria: A11yCriterionReport[] = [
        {
          id: '1.1.1',
          name: 'Non-text Content',
          level: 'A',
          wcagVersion: '2.2',
          conformance: 'notEvaluated',
          automatedCoverage: true,
          manualVerified: false,
          remarks: '',
          affectedComponents: [],
        },
        {
          id: '1.2.1',
          name: 'Audio-only and Video-only',
          level: 'A',
          wcagVersion: '2.2',
          conformance: 'notEvaluated',
          automatedCoverage: true,
          manualVerified: false,
          remarks: '',
          affectedComponents: [],
        },
      ];
      const summary = createSummary(components, criteria, 55);

      // With 2 criteria covered out of 55 total
      expect(summary.automatedCoverage).toBe('4%');
    });

    it('should set manualCoverage to 0%', () => {
      const components: A11yComponentReport[] = [];
      const summary = createSummary(components, [], 55);

      expect(summary.manualCoverage).toBe('0%');
    });

    it('should handle 100% automated coverage', () => {
      const components: A11yComponentReport[] = [];
      const criteria: A11yCriterionReport[] = Array.from(
        {length: 55},
        (_, i) => ({
          id: `${Math.floor(i / 9) + 1}.${(i % 9) + 1}.${1}`,
          name: `Criterion ${i}`,
          level: 'A' as const,
          wcagVersion: '2.2' as const,
          conformance: 'notEvaluated' as const,
          automatedCoverage: true,
          manualVerified: false,
          remarks: '',
          affectedComponents: [],
        })
      );
      const summary = createSummary(components, criteria, 55);

      expect(summary.automatedCoverage).toBe('100%');
    });

    it('should handle 0% automated coverage', () => {
      const components: A11yComponentReport[] = [];
      const criteria: A11yCriterionReport[] = [];
      const summary = createSummary(components, criteria, 55);

      expect(summary.automatedCoverage).toBe('0%');
    });
  });

  describe('empty components array', () => {
    it('should return valid summary with zero components', () => {
      const summary = createSummary([], [], 55);

      expect(summary.totalComponents).toBe(0);
      expect(summary.litComponents).toBe(0);
      expect(summary.stencilComponents).toBe(0);
      expect(summary.storyCoverage.total).toBe(0);
      expect(summary.storyCoverage.withA11y).toBe(0);
      expect(summary.storyCoverage.excludedFromA11y).toBe(0);
    });
  });

  describe('totalCriteria parameter', () => {
    it('should use totalCriteria for notEvaluated and totalCriteria field', () => {
      const components: A11yComponentReport[] = [];
      const summary = createSummary(components, [], 55);

      expect(summary.totalCriteria).toBe(55);
      expect(summary.notEvaluated).toBe(55);
    });

    it('should handle different totalCriteria values', () => {
      const components: A11yComponentReport[] = [];
      const summary38 = createSummary(components, [], 38);
      const summary55 = createSummary(components, [], 55);

      expect(summary38.totalCriteria).toBe(38);
      expect(summary38.notEvaluated).toBe(38);
      expect(summary55.totalCriteria).toBe(55);
      expect(summary55.notEvaluated).toBe(55);
    });
  });
});
