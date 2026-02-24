import {wcagCriteriaDefinitions} from '../data/wcag-criteria.js';
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

function buildCriterionAggregates(
  components: A11yComponentReport[],
  criteria: A11yCriterionReport[]
): Map<string, CriterionAggregate> {
  const aggregates = new Map<string, CriterionAggregate>();

  for (const component of components) {
    for (const criterionId of component.automated.criteriaCovered) {
      const aggregate = aggregates.get(criterionId) ?? {
        coveredComponents: new Set<string>(),
        violatingComponents: new Set<string>(),
      };

      aggregate.coveredComponents.add(component.name);
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
      aggregate.violatingComponents.add(componentName);
    }

    aggregates.set(criterion.id, aggregate);
  }

  return aggregates;
}

function buildCriterionComponents(
  conformance: OpenAcrCriterion['conformance'],
  remarks: string
): OpenAcrCriterionComponent[] {
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

function buildManualAggregateIndex(
  manualAggregates: Map<string, ManualAuditAggregate[]>
): Map<string, ManualAuditAggregate[]> {
  const index = new Map<string, ManualAuditAggregate[]>();
  for (const [key, entries] of manualAggregates) {
    const criterionId = key.split(':')[1];
    const existing = index.get(criterionId) ?? [];
    index.set(criterionId, [...existing, ...entries]);
  }
  return index;
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
  const manualByCriterion = buildManualAggregateIndex(manualAggregates);

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
    const manualForCriterion = manualByCriterion.get(definition.id);

    const conformance = resolveConformance(
      criterionFromReport,
      aggregate,
      manualForCriterion,
      override
    );
    const remarks = buildRemarks(
      definition.id,
      conformance,
      coveredComponents,
      violatingComponents,
      manualForCriterion,
      override
    );

    criteriaByChapter[definition.chapterId].push({
      num: definition.id,
      handle: definition.handle,
      level: definition.level,
      conformance,
      remarks,
      components: buildCriterionComponents(conformance, remarks),
    });
  }

  return criteriaByChapter;
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
