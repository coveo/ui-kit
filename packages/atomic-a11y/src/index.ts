export {
  type JsonToOpenAcrOptions,
  transformJsonToOpenAcr,
} from './reporter/json-to-openacr.js';
export {mergeA11yShardReports} from './reporter/merge-shards.js';
export {
  type A11yAutomatedResults,
  type A11yComponentReport,
  type A11yCriterionReport,
  type A11yIncompleteDetail,
  type A11yReport,
  type A11yReporterOptions,
  type A11ySummary,
  DEFAULT_A11Y_REPORT_FILENAME,
  DEFAULT_A11Y_REPORT_OUTPUT_DIR,
  DEFAULT_WCAG_22_AA_CRITERIA_COUNT,
  VitestA11yReporter,
} from './reporter/vitest-a11y-reporter.js';
