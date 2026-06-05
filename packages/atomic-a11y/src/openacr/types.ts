import type {A11yCriterionReport} from '../shared/types.js';

export type ChapterId =
  | 'success_criteria_level_a'
  | 'success_criteria_level_aa';

export type OpenAcrConformance =
  | 'supports'
  | 'partially-supports'
  | 'does-not-support'
  | 'not-applicable';

export interface CriterionAggregate {
  coveredComponents: Set<string>;
  violatingComponents: Set<string>;
}

export interface InteractiveAggregate {
  coveredComponents: Set<string>;
}

export interface A11yOverrideEntry {
  criterion: string;
  conformance: OpenAcrConformance;
  reason: string;
}

interface ManualAuditCriterionValue {
  conformance: string;
  remarks?: string;
}

/**
 * A manual-audit file: one surface-scoped record of audited criteria.
 * `surface` is a free-text label for QA organization only — the pipeline
 * attaches no meaning to it and it does not appear in the VPAT.
 */
export interface ManualAuditFile {
  surface?: string;
  wcag22Criteria: Record<string, string | ManualAuditCriterionValue>;
}

export interface ManualAuditAggregate {
  criterionId: string;
  conformance: OpenAcrConformance;
  remarks?: string;
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

interface OpenAcrChapter {
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
  ]);

export const manualStatusToConformance: Record<string, OpenAcrConformance> = {
  pass: 'supports',
  fail: 'does-not-support',
  partial: 'partially-supports',
  'not-applicable': 'not-applicable',
};

/**
 * Severity ranking for worst-wins resolution (higher = worse).
 * does-not-support > partially-supports > supports > not-applicable.
 */
export const CONFORMANCE_SEVERITY: Record<OpenAcrConformance, number> = {
  'does-not-support': 3,
  'partially-supports': 2,
  supports: 1,
  'not-applicable': 0,
};

export const reportConformanceToOpenAcr: Record<
  A11yCriterionReport['conformance'],
  OpenAcrConformance
> = {
  supports: 'supports',
  partiallySupports: 'partially-supports',
  doesNotSupport: 'does-not-support',
  notApplicable: 'not-applicable',
};
