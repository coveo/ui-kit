/**
 * Shared types used across the a11y reporter and related utilities.
 */

/**
 * WCAG criterion conformance level.
 * Unified superset from vitest-a11y-reporter.ts and json-to-openacr.ts.
 */
export type CriterionLevel = 'A' | 'AA' | 'AAA' | 'unknown';

/**
 * WCAG version.
 */
export type WCAGVersion = '2.0' | '2.1' | '2.2' | 'unknown';

/**
 * Metadata for a WCAG criterion.
 */
export interface CriterionMetadata {
  name: string;
  level: CriterionLevel;
  wcagVersion: WCAGVersion;
}

/**
 * Incomplete accessibility detail from automated testing.
 */
export interface A11yIncompleteDetail {
  ruleId: string;
  impact: string;
  wcagCriteria: string[];
  nodes: number;
  message: string;
}

/**
 * Automated accessibility test results.
 */
export interface A11yAutomatedResults {
  violations: number;
  passes: number;
  incomplete: number;
  inapplicable: number;
  criteriaCovered: string[];
  incompleteDetails: A11yIncompleteDetail[];
}

/**
 * Component accessibility report.
 */
export interface A11yComponentReport {
  name: string;
  storyCount: number;
  automated: A11yAutomatedResults;
}

/**
 * Criterion accessibility report.
 */
export interface A11yCriterionReport {
  id: string;
  name: string;
  level: CriterionLevel;
  wcagVersion: WCAGVersion;
  conformance:
    | 'supports'
    | 'partiallySupports'
    | 'doesNotSupport'
    | 'notApplicable'
    | 'notEvaluated';
  automatedCoverage: boolean;
  manualVerified: boolean;
  affectedComponents: string[];
}

/**
 * Story coverage information.
 */
interface StoryCoverage {
  total: number;
  withA11y: number;
  excludedFromA11y: number;
}

/**
 * Summary of accessibility report.
 */
export interface A11ySummary {
  totalComponents: number;
  storyCoverage: StoryCoverage;
  totalCriteria: number;
  supports: number;
  partiallySupports: number;
  doesNotSupport: number;
  notApplicable: number;
  notEvaluated: number;
  automatedCoverage: string;
  manualCoverage: string;
}

/**
 * Report metadata.
 */
interface A11yReportMetadata {
  product: string;
  version: string;
  standard: string;
  reportDate: string;
  evaluationMethods: string[];
  axeCoreVersion: string;
  storybookVersion: string;
}

/**
 * Complete accessibility report.
 */
export interface A11yReport {
  report: A11yReportMetadata;
  components: A11yComponentReport[];
  criteria: A11yCriterionReport[];
  summary: A11ySummary;
}
