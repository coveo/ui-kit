export {mergeA11yShardReports} from './reporter/merge-shards.js';
export {
  type A11yReporterOptions,
  VitestA11yReporter,
} from './reporter/vitest-a11y-reporter.js';
export {isA11yReport, isRecord} from './shared/guards.js';
export type {
  A11yAutomatedResults,
  A11yComponentReport,
  A11yCriterionReport,
  A11yIncompleteDetail,
  A11yInteractiveResults,
  A11yReport,
  A11ySummary,
  CriterionLevel,
  CriterionMetadata,
  WCAGVersion,
} from './shared/types.js';
