export const DEFAULT_A11Y_REPORT_OUTPUT_DIR = 'reports';
export const DEFAULT_A11Y_REPORT_FILENAME = 'a11y-report.json';
export const DEFAULT_WCAG_22_AA_CRITERIA_COUNT = 55;
export const BASELINE_FILE_PATTERN =
  /^manual-audit-(?!example\.json$)(?!.*-violations)([\w-]+)\.json$/;
export const DELTA_PATTERN = /^delta-(\d{4}-\d{2}-\d{2})-([\w-]+)\.json$/;
export const VALID_STATUSES = new Set([
  'pass',
  'fail',
  'partial',
  'not-applicable',
]);
export const DEFAULT_MANUAL_PLACEHOLDER_NOTE =
  'Manual audit pending. Phase 3 results will be merged into this report.';
export const UNKNOWN_CATEGORY = 'unknown';
export const UNKNOWN_FRAMEWORK = 'unknown';

/** Root directory for a11y report artifacts (relative to package root). */
export const REPORTS_DIR = 'a11y/reports';

/** Directory for delta files. */
export const DELTAS_DIR = 'a11y/reports/deltas';

/** Directory for archived delta files. */
export const ARCHIVE_DIR = 'a11y/reports/deltas/archived';

export const A11Y_OVERRIDES_FILE = 'a11y/a11y-overrides.json';
export const A11Y_MANUAL_CRITERIA_FILE = 'a11y/a11y-manual-criteria.json';

/** Valid surface areas for component categorization. */
export const VALID_SURFACES = new Set([
  'commerce',
  'search',
  'insight',
  'ipx',
  'common',
  'recommendations',
]);
