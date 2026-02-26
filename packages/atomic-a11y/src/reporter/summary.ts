import type {
  A11yComponentReport,
  A11yCriterionReport,
  A11ySummary,
} from '../shared/types.js';
import {getAutomationCoveragePercentage} from './reporter-utils.js';

export function createSummary(
  components: A11yComponentReport[],
  criteria: A11yCriterionReport[],
  totalCriteria: number
): A11ySummary {
  const litComponents = components.filter(
    (component) => component.framework === 'lit'
  ).length;
  const stencilComponents = components.filter(
    (component) => component.framework === 'stencil'
  ).length;
  const totalStories = components.reduce(
    (accumulator, component) => accumulator + component.storyCount,
    0
  );

  return {
    totalComponents: components.length,
    litComponents,
    stencilComponents,
    stencilExcluded: true,
    storyCoverage: {
      total: totalStories,
      withA11y: totalStories,
      excludedFromA11y: 0,
    },
    totalCriteria,
    supports: 0,
    partiallySupports: 0,
    doesNotSupport: 0,
    notApplicable: 0,
    notEvaluated: totalCriteria,
    automatedCoverage: getAutomationCoveragePercentage(
      criteria.length,
      totalCriteria
    ),
    manualCoverage: '0%',
  };
}
