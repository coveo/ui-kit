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

// ── Script shared constants ───────────────────────────────────────────────────

/** Root directory for a11y report artifacts (relative to package root). */
export const REPORTS_DIR = 'a11y/reports';

/** Directory for delta files. */
export const DELTAS_DIR = 'a11y/reports/deltas';

/** Directory for archived delta files. */
export const ARCHIVE_DIR = 'a11y/reports/deltas/archived';

/** Valid surface areas for component categorization. */
export const VALID_SURFACES = new Set([
  'commerce',
  'search',
  'insight',
  'ipx',
  'common',
  'recommendations',
]);

/** Surface name prefix mapping for story path detection. */
export const SURFACE_PREFIXES: Record<string, string> = {
  commerce: 'commerce',
  search: 'search',
  insight: 'insight',
  ipx: 'ipx',
  recommendations: 'recommendations',
};

/**
 * WCAG 2.2 criteria keys that require manual or AI audit.
 * These are criteria not covered by axe-core automated testing.
 */
export const VALID_WCAG_KEYS = new Set([
  '1.3.2-meaningful-sequence',
  '1.3.3-sensory-characteristics',
  '1.3.4-orientation',
  '1.3.5-identify-input-purpose',
  '1.4.4-resize-text',
  '1.4.5-images-of-text',
  '1.4.10-reflow',
  '1.4.11-non-text-contrast',
  '1.4.12-text-spacing',
  '1.4.13-content-on-hover-focus',
  '2.4.4-link-purpose',
  '2.4.6-headings-and-labels',
  '2.4.7-focus-visible',
  '2.4.11-focus-not-obscured',
  '2.5.7-dragging-movements',
  '2.5.8-target-size',
  '3.2.6-consistent-help',
  '3.3.3-error-suggestion',
  '3.3.4-error-prevention',
  '3.3.7-redundant-entry',
  '3.3.8-accessible-auth',
  '4.1.3-status-messages',
]);

/** All 22 WCAG criteria evaluated by the AI audit agent. */
export const ALL_AI_CRITERIA = [
  '1.3.2-meaningful-sequence',
  '1.3.3-sensory-characteristics',
  '1.3.4-orientation',
  '1.3.5-identify-input-purpose',
  '1.4.4-resize-text',
  '1.4.5-images-of-text',
  '1.4.10-reflow',
  '1.4.11-non-text-contrast',
  '1.4.12-text-spacing',
  '1.4.13-content-on-hover-focus',
  '2.4.4-link-purpose',
  '2.4.6-headings-and-labels',
  '2.4.7-focus-visible',
  '2.4.11-focus-not-obscured',
  '2.5.7-dragging-movements',
  '2.5.8-target-size',
  '3.2.6-consistent-help',
  '3.3.3-error-suggestion',
  '3.3.4-error-prevention',
  '3.3.7-redundant-entry',
  '3.3.8-accessible-auth',
  '4.1.3-status-messages',
] as const;

/**
 * Criteria that are always 'not-applicable' for isolated Storybook components.
 * These are site-wide consistency criteria that cannot be evaluated in isolation:
 * - 3.2.6 Consistent Help: requires cross-page help placement comparison
 * - 3.3.7 Redundant Entry: requires multi-step process context
 * - 3.3.8 Accessible Auth: requires authentication flow context
 *
 * Kept in VALID_WCAG_KEYS (for manual-audit-delta validation) and ALL_AI_CRITERIA
 * (for mergeResults), but skipped during AI LLM calls to save API quota.
 */
export const STATIC_NA_CRITERIA: ReadonlyMap<
  string,
  {status: 'not-applicable'; evidence: string}
> = new Map([
  [
    '3.2.6-consistent-help',
    {
      status: 'not-applicable',
      evidence:
        'Storybook renders components in isolation; cross-page help placement cannot be evaluated.',
    },
  ],
  [
    '3.3.7-redundant-entry',
    {
      status: 'not-applicable',
      evidence:
        'Storybook renders components in isolation; multi-step redundant entry cannot be evaluated.',
    },
  ],
  [
    '3.3.8-accessible-auth',
    {
      status: 'not-applicable',
      evidence:
        'Storybook renders components in isolation; authentication flows cannot be evaluated.',
    },
  ],
]);

/** Audit file pattern for matching baseline manual-audit JSON files. */
export const AUDIT_FILE_PATTERN = /^manual-audit-(.+)\.json$/;

/** Violations file pattern for matching extracted violation files. */
export const VIOLATIONS_FILE_PATTERN = /^manual-audit-(.+)-violations\.json$/;

/** GitHub repository identifier for issue creation. */
export const GITHUB_REPO = 'coveo/ui-kit';
