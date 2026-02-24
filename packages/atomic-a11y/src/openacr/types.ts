import type {A11yCriterionReport, CriterionLevel} from '../shared/types.js';

export type ChapterId =
  | 'success_criteria_level_a'
  | 'success_criteria_level_aa';

export type OpenAcrConformance =
  | 'supports'
  | 'partially-supports'
  | 'does-not-support'
  | 'not-applicable'
  | 'not-evaluated';

export interface CriterionAggregate {
  coveredComponents: Set<string>;
  violatingComponents: Set<string>;
}

export interface A11yOverrideEntry {
  criterion: string;
  conformance: OpenAcrConformance;
  reason: string;
}

export interface ManualAuditBaselineEntry {
  name: string;
  category: string;
  manual: {
    status: string;
    wcag22Criteria: Record<string, string>;
  };
}

export interface ManualAuditAggregate {
  componentName: string;
  criterionId: string;
  conformance: OpenAcrConformance;
}

export interface OpenAcrCriterionComponent {
  name: string;
  adherence: {
    level: OpenAcrConformance;
    notes: string;
  };
}

export interface OpenAcrCriterion {
  num: string;
  handle: string;
  level: CriterionLevel;
  conformance: OpenAcrConformance;
  remarks: string;
  affected_components: string[];
  automated_result: {
    status: 'not-covered' | 'covered-no-violations' | 'covered-with-violations';
    covered_components: string[];
    violating_components: string[];
  };
  manual_result: {
    status: string;
    notes: string;
  };
  components: OpenAcrCriterionComponent[];
}

export interface OpenAcrChapter {
  notes: string;
  criteria: OpenAcrCriterion[];
}

export interface OpenAcrReport {
  title: string;
  product: {
    name: string;
    version: string;
    description: string;
  };
  author: {
    name: string;
    company_name: string;
    email: string;
    website: string;
  };
  vendor: {
    company_name: string;
    email: string;
    website: string;
  };
  report_date: string;
  last_modified_date: string;
  version: number;
  notes: string;
  evaluation_methods_used: string;
  repository: string;
  feedback: string;
  catalog: string;
  standards: Array<{
    standard_name: string;
    standard_ref: string;
    chapters: Array<{chapter_id: ChapterId; chapter_name: string}>;
  }>;
  summary: {
    total_criteria: number;
    supports: number;
    partially_supports: number;
    does_not_support: number;
    not_applicable: number;
    not_evaluated: number;
    automated_covered_criteria: number;
  };
  chapters: {
    success_criteria_level_a: OpenAcrChapter;
    success_criteria_level_aa: OpenAcrChapter;
    success_criteria_level_aaa: {
      disabled: true;
    };
  };
}

export const VALID_OVERRIDE_CONFORMANCE_VALUES: ReadonlySet<OpenAcrConformance> =
  new Set([
    'supports',
    'partially-supports',
    'does-not-support',
    'not-applicable',
    'not-evaluated',
  ]);

export const manualStatusToConformance: Record<string, OpenAcrConformance> = {
  pass: 'supports',
  fail: 'does-not-support',
  partial: 'partially-supports',
  'not-applicable': 'not-applicable',
};

export const reportConformanceToOpenAcr: Record<
  A11yCriterionReport['conformance'],
  OpenAcrConformance
> = {
  supports: 'supports',
  partiallySupports: 'partially-supports',
  doesNotSupport: 'does-not-support',
  notApplicable: 'not-applicable',
  notEvaluated: 'not-evaluated',
};
