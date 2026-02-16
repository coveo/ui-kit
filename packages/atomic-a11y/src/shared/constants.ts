import {wcagCriteriaDefinitions} from '../data/wcag-criteria.js';

export const DEFAULT_A11Y_REPORT_OUTPUT_DIR = 'a11y/reports';
export const DEFAULT_A11Y_REPORT_FILENAME = 'a11y-report.json';
export const DEFAULT_WCAG_22_AA_CRITERIA_COUNT = 50;
export const BASELINE_FILE_PATTERN =
  /^manual-audit-(?!.*-violations)([\w-]+)\.json$/;
export const DELTA_PATTERN = /^delta-(\d{4}-\d{2}-\d{2})-([\w-]+)\.json$/;
export const VALID_STATUSES = new Set([
  'pass',
  'fail',
  'partial',
  'not-applicable',
]);
export const VALID_WCAG_KEYS = new Set(
  wcagCriteriaDefinitions.map((c) => c.id)
);
