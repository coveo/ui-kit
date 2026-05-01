export const DEFAULT_A11Y_REPORT_OUTPUT_DIR = 'reports';
export const DEFAULT_A11Y_REPORT_FILENAME = 'a11y-report.json';
export const DEFAULT_WCAG_22_AA_CRITERIA_COUNT = 55;
export const BASELINE_FILE_PATTERN =
  /^manual-audit-(?!.*-violations)([\w-]+)\.json$/;

export const DELTA_PATTERN = /^delta-(\d{4}-\d{2}-\d{2})-([\w-]+)\.json$/;
export const VALID_STATUSES = new Set([
  'pass',
  'fail',
  'partial',
  'not-applicable',
]);
/^manual-audit-(?!example\.json$)(?!.*-violations)([\w-]+)\.json$/;
export const DEFAULT_MANUAL_PLACEHOLDER_NOTE =
  'Manual audit pending. Phase 3 results will be merged into this report.';
