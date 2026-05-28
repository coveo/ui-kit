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
  const automatedCoveredCriteria = criteria.filter(
    (criterion) => criterion.automatedCoverage
  ).length;
  const interactiveCoveredCriteria = criteria.filter(
    (criterion) => criterion.interactiveCoverage
  ).length;
  const interactivePassedCriteria = criteria.filter(
    (criterion) => criterion.interactiveStatus === 'passed'
  ).length;
  const interactiveStatusCriteria = criteria.filter(
    (criterion) => criterion.interactiveStatus !== undefined
  ).length;

  const supports = criteria.filter((c) => c.conformance === 'supports').length;
  const partiallySupports = criteria.filter(
    (c) => c.conformance === 'partiallySupports'
  ).length;
  const doesNotSupport = criteria.filter(
    (c) => c.conformance === 'doesNotSupport'
  ).length;
  const notApplicable = criteria.filter(
    (c) => c.conformance === 'notApplicable'
  ).length;

  return {
    totalComponents: components.length,
    storyCoverage: {
      total: totalStories,
      withA11y: totalStories,
      excludedFromA11y: 0,
    },
    totalCriteria,
    supports,
    partiallySupports,
    doesNotSupport,
    notApplicable,
    notEvaluated:
      totalCriteria -
      supports -
      partiallySupports -
      doesNotSupport -
      notApplicable,
    automatedCoverage: getAutomationCoveragePercentage(
      automatedCoveredCriteria,
      totalCriteria
    ),
    interactiveCoverage: getAutomationCoveragePercentage(
      interactiveCoveredCriteria,
      totalCriteria
    ),
    interactivePassRate: getAutomationCoveragePercentage(
      interactivePassedCriteria,
      interactiveStatusCriteria
    ),
    manualCoverage: '0%',
  };
}
