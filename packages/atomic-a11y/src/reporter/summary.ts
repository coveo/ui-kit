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
  const totalStories = components.reduce(
    (accumulator, component) => accumulator + component.storyCount,
    0
  );
  const totalCriteria = 55; // Hardcoded for WCAG 2.2 AA, update if criteria set changes
  const interactiveCoveredCriteria = criteria.filter(
    (criterion) => criterion.interactiveCoverage
  ).length;
  const interactivePassedCriteria = criteria.filter(
    (criterion) => criterion.interactiveStatus === 'passed'
  ).length;

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
    interactiveCoverage: getAutomationCoveragePercentage(
      interactiveCoveredCriteria,
      totalCriteria
    ),
    interactivePassRate: getAutomationCoveragePercentage(
      interactivePassedCriteria,
      interactiveCoveredCriteria
    ),
    manualCoverage: '0%',
  };
}
