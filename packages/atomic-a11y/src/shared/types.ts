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
 * Supported framework types.
 */
export type SupportedFramework = 'lit' | 'stencil' | 'unknown';

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
 * Interactive accessibility test results from Storybook play() functions.
 */
export interface A11yInteractiveResults {
  criteriaCovered: string[];
  testCount: number;
  passedCount: number;
  failedCount: number;
  failedCriteria: string[];
}

/**
 * Component accessibility report.
 */
export interface A11yComponentReport {
  name: string;
  category: string;
  framework: SupportedFramework;
  storyCount: number;
  automated: A11yAutomatedResults;
  interactive?: A11yInteractiveResults;
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
  interactiveCoverage: boolean;
  interactiveStatus?: 'passed' | 'failed' | 'mixed';
  manualVerified: boolean;
  remarks: string;
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
  litComponents: number;
  stencilComponents: number;
  stencilExcluded: boolean;
  storyCoverage: StoryCoverage;
  totalCriteria: number;
  supports: number;
  partiallySupports: number;
  doesNotSupport: number;
  notApplicable: number;
  notEvaluated: number;
  automatedCoverage: string;
  interactiveCoverage: string;
  interactivePassRate: string;
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

// ── Script shared types ──────────────────────────────────────────────────────

/**
 * A single component entry in a delta file.
 * Used by manual-audit-delta and ai-wcag-audit scripts.
 */
export interface DeltaEntry {
  name: string;
  surface: string;
  auditor: string;
  auditDate?: string;
  results: {
    keyboardNav?: string;
    screenReader?: string;
    focusManagement?: string;
    wcag22Criteria?: Record<string, string>;
    notes: string;
  };
}

/**
 * Complete delta file structure written by audit scripts.
 */
export interface DeltaFile {
  file: string;
  filePath: string;
  data: {
    date: string;
    pr: string | number;
    auditor: string;
    entries: DeltaEntry[];
  };
}

/**
 * A single component entry in a baseline manual-audit JSON file.
 */
export interface BaselineEntry {
  name: string;
  category: string;
  manual: {
    status: string;
    tier: number;
    keyboardNav: string;
    screenReader: string;
    focusManagement: string;
    wcag22Criteria: Record<string, string>;
    notes: string;
    lastAuditDate?: string;
    auditor?: string;
  };
}
