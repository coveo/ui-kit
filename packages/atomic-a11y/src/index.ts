export {
  buildAxeRuleCriteriaMap,
  extractCriteriaFromTags,
} from './data/axe-rule-mappings.js';
export {getCriterionMetadata} from './data/criterion-metadata.js';
export type {WcagCriterionDefinition} from './data/wcag-criteria.js';
export {wcagCriteriaDefinitions} from './data/wcag-criteria.js';
export {mergeA11yShardReports} from './reporter/merge-shards.js';
export {
  type A11yReporterOptions,
  VitestA11yReporter,
} from './reporter/vitest-a11y-reporter.js';
export {
  BASELINE_FILE_PATTERN,
  DEFAULT_A11Y_REPORT_FILENAME,
  DEFAULT_A11Y_REPORT_OUTPUT_DIR,
  DEFAULT_WCAG_22_AA_CRITERIA_COUNT,
} from './shared/constants.js';
export {readJsonFile} from './shared/file-utils.js';
export {isA11yReport, isRecord} from './shared/guards.js';
export type {
  A11yAutomatedResults,
  A11yComponentReport,
  A11yCriterionReport,
  A11yIncompleteDetail,
  A11yReport,
  A11ySummary,
  CriterionLevel,
  CriterionMetadata,
  SupportedFramework,
  WCAGVersion,
} from './shared/types.js';
