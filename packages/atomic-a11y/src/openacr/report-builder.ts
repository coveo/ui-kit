import {wcagCriteriaDefinitions} from '../data/wcag-criteria.js';
import {
  getInteractiveCriteriaFailed,
  getInteractiveCriteriaPassed,
  getInteractiveCriteriaWarnings,
} from '../shared/evidence.js';
import type {A11yComponentReport, A11yReport} from '../shared/types.js';
import {buildRemarks, resolveConformance} from './conformance.js';
import type {
  A11yOverrideEntry,
  ChapterId,
  CriterionAggregate,
  InteractiveAggregate,
  ManualAuditAggregate,
  OpenAcrConformance,
  OpenAcrCriterion,
  OpenAcrCriterionComponent,
  OpenAcrReport,
} from './types.js';

const DEFAULT_REPORT_TITLE = 'Coveo Accessibility Conformance Report';
const DEFAULT_REPORT_PRODUCT_NAME = 'Coveo Atomic';
const DEFAULT_REPORT_DATE = new Date().toISOString().slice(0, 10);

function buildCriterionAggregates(
  components: A11yComponentReport[]
): Map<string, CriterionAggregate> {
  const aggregates = new Map<string, CriterionAggregate>();

  const getAggregate = (criterionId: string) => {
    const aggregate = aggregates.get(criterionId) ?? {
      passedComponents: new Set<string>(),
      violatingComponents: new Set<string>(),
      incompleteComponents: new Set<string>(),
    };
    aggregates.set(criterionId, aggregate);
    return aggregate;
  };

  for (const component of components) {
    for (const criterionId of component.automated.criteriaPassed) {
      getAggregate(criterionId).passedComponents.add(component.name);
    }
    for (const criterionId of component.automated.criteriaViolated) {
      getAggregate(criterionId).violatingComponents.add(component.name);
    }
    for (const incomplete of component.automated.incompleteDetails) {
      for (const criterionId of incomplete.wcagCriteria) {
        getAggregate(criterionId).incompleteComponents.add(component.name);
      }
    }
  }

  return aggregates;
}

function buildInteractiveAggregates(
  components: A11yComponentReport[]
): Map<string, InteractiveAggregate> {
  const aggregates = new Map<string, InteractiveAggregate>();

  const getAggregate = (criterionId: string) => {
    const aggregate = aggregates.get(criterionId) ?? {
      passedComponents: new Set<string>(),
      failedComponents: new Set<string>(),
      warningComponents: new Set<string>(),
    };
    aggregates.set(criterionId, aggregate);
    return aggregate;
  };

  for (const component of components) {
    if (!component.interactive) {
      continue;
    }

    for (const criterionId of getInteractiveCriteriaPassed(
      component.interactive
    )) {
      getAggregate(criterionId).passedComponents.add(component.name);
    }
    for (const criterionId of getInteractiveCriteriaFailed(
      component.interactive
    )) {
      getAggregate(criterionId).failedComponents.add(component.name);
    }
    for (const criterionId of getInteractiveCriteriaWarnings(
      component.interactive
    )) {
      getAggregate(criterionId).warningComponents.add(component.name);
    }
  }

  return aggregates;
}

function buildCriterionComponents(
  conformance: OpenAcrConformance,
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

function buildOpenAcrCriteria(
  report: A11yReport,
  overrides: Map<string, A11yOverrideEntry>,
  manualAggregates: Map<string, ManualAuditAggregate[]>
): {
  success_criteria_level_a: OpenAcrCriterion[];
  success_criteria_level_aa: OpenAcrCriterion[];
} {
  const aggregates = buildCriterionAggregates(report.components);
  const interactiveAggregates = buildInteractiveAggregates(report.components);

  const criteriaByChapter: Record<ChapterId, OpenAcrCriterion[]> = {
    success_criteria_level_a: [],
    success_criteria_level_aa: [],
  };

  for (const definition of wcagCriteriaDefinitions) {
    const conformanceContext = {
      aggregate: aggregates.get(definition.id),
      interactiveAggregate: interactiveAggregates.get(definition.id),
      manualAggregates: manualAggregates.get(definition.id),
      override: overrides.get(definition.id),
    };

    const conformance = resolveConformance(conformanceContext);
    const remarks = buildRemarks({
      ...conformanceContext,
      criterionId: definition.id,
      conformance,
    });

    criteriaByChapter[definition.chapterId].push({
      num: definition.id,
      components: buildCriterionComponents(conformance, remarks),
    });
  }

  return criteriaByChapter;
}

export function buildOpenAcrReport(
  report: A11yReport,
  overrides: Map<string, A11yOverrideEntry>,
  manualAggregates: Map<string, ManualAuditAggregate[]>
): OpenAcrReport {
  const reportDate = report.report.reportDate ?? DEFAULT_REPORT_DATE;
  const reportProductName =
    report.report.product ?? DEFAULT_REPORT_PRODUCT_NAME;

  if (!report.report.version) {
    throw new Error(
      'report.version is required to generate the OpenACR report'
    );
  }
  const reportVersion = report.report.version;

  let evaluationMethods = report.report.evaluationMethods?.length
    ? report.report.evaluationMethods.join('; ')
    : 'axe-core Storybook scans';

  if (manualAggregates.size > 0) {
    if (!evaluationMethods.includes('Manual audit')) {
      evaluationMethods += '; Manual audit';
    }
  }

  const criteriaByChapter = buildOpenAcrCriteria(
    report,
    overrides,
    manualAggregates
  );

  const successNotes =
    'Conformance is based on automated Storybook + axe-core output and interactive keyboard testing.';

  return {
    title: DEFAULT_REPORT_TITLE,
    product: {
      name: reportProductName,
      version: reportVersion,
      description:
        'Coveo Atomic is a web component library for building search and commerce interfaces.',
    },
    author: {
      name: 'Coveo Accessibility Team',
      company_name: 'Coveo',
      email: 'support@coveo.com',
      website: 'https://www.coveo.com',
    },
    vendor: {
      company_name: 'Coveo',
      email: 'support@coveo.com',
      website: 'https://www.coveo.com',
    },
    report_date: reportDate,
    last_modified_date: DEFAULT_REPORT_DATE,
    version: 1,
    notes:
      'Generated from a11y/reports/a11y-report.json. Conformance is derived from axe-core results, interactive keyboard tests, and manual audits.',
    evaluation_methods_used: evaluationMethods,
    repository: 'https://github.com/coveo/ui-kit',
    feedback: 'https://github.com/coveo/ui-kit/issues',
    catalog: '2.5-edition-wcag-2.2-508-eu-en',
    chapters: {
      success_criteria_level_a: {
        notes: successNotes,
        criteria: criteriaByChapter.success_criteria_level_a,
      },
      success_criteria_level_aa: {
        notes: successNotes,
        criteria: criteriaByChapter.success_criteria_level_aa,
      },
      success_criteria_level_aaa: {
        disabled: true,
      },
    },
  };
}
