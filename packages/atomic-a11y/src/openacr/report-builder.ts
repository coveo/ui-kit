import {wcagCriteriaDefinitions} from '../data/wcag-criteria.js';
import {DEFAULT_MANUAL_PLACEHOLDER_NOTE} from '../shared/constants.js';
import {compareByNumericId} from '../shared/sorting.js';
import type {
  A11yComponentReport,
  A11yCriterionReport,
  A11yReport,
} from '../shared/types.js';
import {buildRemarks, resolveConformance} from './conformance.js';
import type {
  A11yOverrideEntry,
  ChapterId,
  CriterionAggregate,
  ManualAuditAggregate,
  OpenAcrCriterion,
  OpenAcrCriterionComponent,
  OpenAcrReport,
} from './types.js';

const DEFAULT_REPORT_TITLE = 'Coveo Accessibility Conformance Report';
const DEFAULT_REPORT_PRODUCT_NAME = 'Coveo Atomic';
const DEFAULT_REPORT_PRODUCT_VERSION = '3.x.x';
const DEFAULT_REPORT_DATE = new Date().toISOString().slice(0, 10);
const DEFAULT_REPORT_STANDARD = 'WCAG 2.2 AA';
const DEFAULT_REPORT_STANDARD_REFERENCE = 'https://www.w3.org/TR/WCAG22/';

function buildCriterionAggregates(
  components: A11yComponentReport[],
  criteria: A11yCriterionReport[]
): Map<string, CriterionAggregate> {
  const aggregates = new Map<string, CriterionAggregate>();
  const componentByName = new Map<string, A11yComponentReport>();

  for (const component of components) {
    componentByName.set(component.name, component);

    for (const criterionId of component.automated.criteriaCovered) {
      const aggregate = aggregates.get(criterionId) ?? {
        coveredComponents: new Set<string>(),
        violatingComponents: new Set<string>(),
      };

      aggregate.coveredComponents.add(component.name);
      if (component.automated.violations > 0) {
        aggregate.violatingComponents.add(component.name);
      }

      aggregates.set(criterionId, aggregate);
    }
  }

  for (const criterion of criteria) {
    const aggregate = aggregates.get(criterion.id) ?? {
      coveredComponents: new Set<string>(),
      violatingComponents: new Set<string>(),
    };

    for (const componentName of criterion.affectedComponents) {
      aggregate.coveredComponents.add(componentName);
      const matchedComponent = componentByName.get(componentName);
      if (matchedComponent && matchedComponent.automated.violations > 0) {
        aggregate.violatingComponents.add(componentName);
      }
    }

    aggregates.set(criterion.id, aggregate);
  }

  return aggregates;
}

function buildCriterionComponents(
  conformance: OpenAcrCriterion['conformance'],
  remarks: string,
  coveredComponents: string[]
): OpenAcrCriterionComponent[] {
  if (coveredComponents.length === 0) {
    return [
      {
        name: 'web',
        adherence: {
          level: conformance,
          notes: remarks,
        },
      },
    ];
  }

  return coveredComponents.map((componentName) => {
    return {
      name: componentName,
      adherence: {
        level: conformance,
        notes: remarks,
      },
    };
  });
}

function buildOpenAcrCriteria(
  report: A11yReport | null,
  overrides: Map<string, A11yOverrideEntry>,
  manualAggregates: Map<string, ManualAuditAggregate[]>
): {
  success_criteria_level_a: OpenAcrCriterion[];
  success_criteria_level_aa: OpenAcrCriterion[];
} {
  const criteriaById = new Map(
    (report?.criteria ?? []).map((criterion) => [criterion.id, criterion])
  );
  const aggregates = buildCriterionAggregates(
    report?.components ?? [],
    report?.criteria ?? []
  );

  const criteriaByChapter: Record<ChapterId, OpenAcrCriterion[]> = {
    success_criteria_level_a: [],
    success_criteria_level_aa: [],
  };

  for (const definition of wcagCriteriaDefinitions) {
    const aggregate = aggregates.get(definition.id);
    const criterionFromReport = criteriaById.get(definition.id);
    const override = overrides.get(definition.id);
    const coveredComponents = [...(aggregate?.coveredComponents ?? [])].sort(
      compareByNumericId
    );
    const violatingComponents = [
      ...(aggregate?.violatingComponents ?? []),
    ].sort(compareByNumericId);

    const manualAggregatesForCriterion = Array.from(manualAggregates.entries())
      .filter(([key]) => key.endsWith(`:${definition.id}`))
      .flatMap(([, entries]) => entries);

    const conformance = resolveConformance(
      criterionFromReport,
      aggregate,
      manualAggregatesForCriterion.length > 0
        ? manualAggregatesForCriterion
        : undefined,
      override
    );
    const remarks = buildRemarks(
      definition.id,
      conformance,
      coveredComponents,
      violatingComponents,
      manualAggregatesForCriterion.length > 0
        ? manualAggregatesForCriterion
        : undefined,
      override
    );

    const manualResultStatus =
      manualAggregatesForCriterion.length > 0 ? 'evaluated' : 'not-evaluated';
    const manualResultNotes =
      manualAggregatesForCriterion.length > 0
        ? remarks
        : DEFAULT_MANUAL_PLACEHOLDER_NOTE;

    criteriaByChapter[definition.chapterId].push({
      num: definition.id,
      handle: definition.handle,
      level: definition.level,
      conformance,
      remarks,
      affected_components: coveredComponents,
      automated_result: {
        status:
          coveredComponents.length === 0
            ? 'not-covered'
            : violatingComponents.length > 0
              ? 'covered-with-violations'
              : 'covered-no-violations',
        covered_components: coveredComponents,
        violating_components: violatingComponents,
      },
      manual_result: {
        status: manualResultStatus,
        notes: manualResultNotes,
      },
      components: buildCriterionComponents(
        conformance,
        remarks,
        coveredComponents
      ),
    });
  }

  return criteriaByChapter;
}

function buildSummary(
  levelA: OpenAcrCriterion[],
  levelAA: OpenAcrCriterion[]
): OpenAcrReport['summary'] {
  const criteria = [...levelA, ...levelAA];
  const summary = {
    total_criteria: criteria.length,
    supports: 0,
    partially_supports: 0,
    does_not_support: 0,
    not_applicable: 0,
    not_evaluated: 0,
    automated_covered_criteria: 0,
  };

  for (const criterion of criteria) {
    if (criterion.automated_result.status !== 'not-covered') {
      summary.automated_covered_criteria += 1;
    }

    if (criterion.conformance === 'supports') {
      summary.supports += 1;
      continue;
    }

    if (criterion.conformance === 'partially-supports') {
      summary.partially_supports += 1;
      continue;
    }

    if (criterion.conformance === 'does-not-support') {
      summary.does_not_support += 1;
      continue;
    }

    if (criterion.conformance === 'not-applicable') {
      summary.not_applicable += 1;
      continue;
    }

    summary.not_evaluated += 1;
  }

  return summary;
}

export function buildOpenAcrReport(
  report: A11yReport | null,
  overrides: Map<string, A11yOverrideEntry>,
  manualAggregates: Map<string, ManualAuditAggregate[]>
): OpenAcrReport {
  const reportDate = report?.report.reportDate ?? DEFAULT_REPORT_DATE;
  const reportProductName =
    report?.report.product ?? DEFAULT_REPORT_PRODUCT_NAME;
  const reportProductVersion =
    report?.report.version ?? DEFAULT_REPORT_PRODUCT_VERSION;

  let evaluationMethods = report?.report.evaluationMethods?.length
    ? report.report.evaluationMethods.join('; ')
    : 'axe-core Storybook scans';

  if (manualAggregates.size > 0) {
    if (!evaluationMethods.includes('Manual audit')) {
      evaluationMethods += '; Manual audit';
    }
  } else {
    evaluationMethods += '; manual audit placeholders pending';
  }

  const criteriaByChapter = buildOpenAcrCriteria(
    report,
    overrides,
    manualAggregates
  );
  const summary = buildSummary(
    criteriaByChapter.success_criteria_level_a,
    criteriaByChapter.success_criteria_level_aa
  );

  return {
    title: DEFAULT_REPORT_TITLE,
    product: {
      name: reportProductName,
      version: reportProductVersion,
      description:
        'Coveo Atomic is a web component library for building search and commerce interfaces.',
    },
    author: {
      name: 'Coveo Accessibility Team',
      company_name: 'Coveo',
      email: 'accessibility@coveo.com',
      website: 'https://www.coveo.com',
    },
    vendor: {
      company_name: 'Coveo',
      email: 'accessibility@coveo.com',
      website: 'https://www.coveo.com',
    },
    report_date: reportDate,
    last_modified_date: DEFAULT_REPORT_DATE,
    version: 1,
    notes:
      'Generated from a11y/reports/a11y-report.json. Automated statuses are derived from axe-core results, with manual placeholders for Phase 3.',
    evaluation_methods_used: evaluationMethods,
    repository: 'https://github.com/coveo/ui-kit',
    feedback: 'https://github.com/coveo/ui-kit/issues',
    catalog: '2.5-edition-wcag-2.2-en',
    standards: [
      {
        standard_name: DEFAULT_REPORT_STANDARD,
        standard_ref: DEFAULT_REPORT_STANDARD_REFERENCE,
        chapters: [
          {
            chapter_id: 'success_criteria_level_a',
            chapter_name: 'Table 1: Success Criteria, Level A',
          },
          {
            chapter_id: 'success_criteria_level_aa',
            chapter_name: 'Table 2: Success Criteria, Level AA',
          },
        ],
      },
    ],
    summary,
    chapters: {
      success_criteria_level_a: {
        notes:
          'Conformance is based on automated Storybook + axe-core output and pending manual validation.',
        criteria: criteriaByChapter.success_criteria_level_a,
      },
      success_criteria_level_aa: {
        notes:
          'Conformance is based on automated Storybook + axe-core output and pending manual validation.',
        criteria: criteriaByChapter.success_criteria_level_aa,
      },
      success_criteria_level_aaa: {
        disabled: true,
      },
    },
  };
}
