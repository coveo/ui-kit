import type {A11yCriterionReport} from '../shared/types.js';

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

export interface ManualConformanceCounts {
  pass: number;
  fail: number;
  partial: number;
  notApplicable: number;
}

export function countManualConformances(
  aggregates: ManualAuditAggregate[]
): ManualConformanceCounts {
  let pass = 0;
  let fail = 0;
  let partial = 0;
  let notApplicable = 0;

  for (const aggregate of aggregates) {
    switch (aggregate.conformance) {
      case 'supports':
        pass++;
        break;
      case 'does-not-support':
        fail++;
        break;
      case 'partially-supports':
        partial++;
        break;
      case 'not-applicable':
        notApplicable++;
        break;
    }
  }

  return {pass, fail, partial, notApplicable};
}
