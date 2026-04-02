import {DEFAULT_WCAG_22_AA_CRITERIA_COUNT} from '../shared/constants.js';
import type {
  A11yComponentReport,
  A11yCriterionReport,
  A11ySummary,
} from '../shared/types.js';
import {getAutomationCoveragePercentage} from './reporter-utils.js';

export function createSummary(
  components: A11yComponentReport[],
  criteria: A11yCriterionReport[]
): A11ySummary {
  const totalCriteria = DEFAULT_WCAG_22_AA_CRITERIA_COUNT;
  const totalStories = components.reduce(
    (accumulator, component) => accumulator + component.storyCount,
    0
  );

  return {
    totalComponents: components.length,
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
