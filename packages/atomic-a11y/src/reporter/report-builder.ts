import {compareByName, compareByNumericId} from '../shared/sorting.js';
import type {
  A11yComponentReport,
  A11yCriterionReport,
  A11yReport,
} from '../shared/types.js';
import {
  type ComponentAccumulator,
  formatDate,
  getCriterionMetadata,
  type PackageMetadata,
} from './reporter-utils.js';
import {createSummary} from './summary.js';

export function buildA11yReport(
  componentResults: Map<string, ComponentAccumulator>,
  packageMetadata: PackageMetadata,
  detectedAxeCoreVersion?: string
): A11yReport {
  const components = buildComponents(componentResults);
  const criteria = buildCriteria(componentResults);
  const hasInteractiveData = [...componentResults.values()].some(
    (c) => c.interactive !== undefined
  );

  const axeCoreVersion =
    detectedAxeCoreVersion ??
    packageMetadata.devDependencies?.['axe-core'] ??
    packageMetadata.dependencies?.['axe-core'] ??
    'unknown';

  const storybookVersion =
    packageMetadata.devDependencies?.storybook ??
    packageMetadata.dependencies?.storybook;

  if (!storybookVersion) {
    throw new Error('storybook version not found in package metadata');
  }

  return {
    report: {
      product: 'Coveo Atomic',
      version: packageMetadata.version,
      standard: 'WCAG 2.2 AA',
      reportDate: formatDate(new Date()),
      evaluationMethods: [
        `axe-core ${axeCoreVersion}`,
        'Storybook addon-a11y',
        ...(hasInteractiveData ? ['Storybook interactive play() tests'] : []),
        'Manual audit',
      ],
      axeCoreVersion,
      storybookVersion,
    },
    components,
    criteria,
    summary: createSummary(components, criteria),
  };
}

function buildComponents(
  componentResults: Map<string, ComponentAccumulator>
): A11yComponentReport[] {
  return [...componentResults.values()]
    .map((component): A11yComponentReport => {
      return {
        name: component.name,
        storyCount: component.storyIds.size,
        automated: {
          violations: component.automated.violations,
          passes: component.automated.passes,
          incomplete: component.automated.incomplete,
          inapplicable: component.automated.inapplicable,
          criteriaCovered: [...component.automated.criteriaCovered].sort(
            compareByNumericId
          ),
          criteriaViolated: [...component.automated.criteriaViolated].sort(
            compareByNumericId
          ),
          criteriaPassed: [...component.automated.criteriaPassed].sort(
            compareByNumericId
          ),
          incompleteDetails: component.automated.incompleteDetails,
        },
        interactive: component.interactive
          ? {
              criteriaCovered: [...component.interactive.criteriaCovered].sort(
                compareByNumericId
              ),
              testCount: component.interactive.testCount,
              passedCount: component.interactive.passedCount,
            }
          : undefined,
      };
    })
    .sort((first, second) => compareByName(first.name, second.name));
}

function buildCriteria(
  componentResults: Map<string, ComponentAccumulator>
): A11yCriterionReport[] {
  const criteriaById = new Map<string, A11yCriterionReport>();

  for (const component of componentResults.values()) {
    for (const criterionId of component.automated.criteriaCovered) {
      const criterion = getOrCreateCriterion(criteriaById, criterionId);
      criterion.automatedCoverage = true;
      addComponent(criterion.coveredComponents, component.name);
    }

    for (const criterionId of component.automated.criteriaViolated) {
      const criterion = getOrCreateCriterion(criteriaById, criterionId);
      addComponent(criterion.violatingComponents, component.name);
    }

    if (component.interactive) {
      for (const criterionId of component.interactive.criteriaCovered) {
        const criterion = getOrCreateCriterion(criteriaById, criterionId);
        criterion.interactiveCoverage = true;
        criterion.interactiveStatus = 'passed';
        addComponent(criterion.coveredComponents, component.name);
      }
    }
  }

  const criteria = [...criteriaById.values()];
  for (const criterion of criteria) {
    criterion.coveredComponents.sort(compareByName);
    criterion.violatingComponents.sort(compareByName);
    criterion.conformance = resolveAutomatedConformance(criterion);
  }

  return criteria.sort((first, second) =>
    compareByNumericId(first.id, second.id)
  );
}

function resolveAutomatedConformance(
  criterion: A11yCriterionReport
): A11yCriterionReport['conformance'] {
  const coveredCount = criterion.coveredComponents.length;
  if (coveredCount === 0) {
    return 'notEvaluated';
  }

  const violatingCount = criterion.violatingComponents.length;
  if (violatingCount >= coveredCount) {
    return 'doesNotSupport';
  }
  if (violatingCount > 0) {
    return 'partiallySupports';
  }

  // No violations — check if any component has an explicit pass for this criterion
  // (not just incomplete/inapplicable coverage)
  return 'supports';
}

function getOrCreateCriterion(
  criteriaById: Map<string, A11yCriterionReport>,
  criterionId: string
): A11yCriterionReport {
  const existing = criteriaById.get(criterionId);
  if (existing) {
    return existing;
  }

  const metadata = getCriterionMetadata(criterionId);
  const criterion: A11yCriterionReport = {
    id: criterionId,
    name: metadata.name,
    level: metadata.level,
    wcagVersion: metadata.wcagVersion,
    conformance: 'notEvaluated',
    automatedCoverage: false,
    interactiveCoverage: false,
    manualVerified: false,
    coveredComponents: [],
    violatingComponents: [],
  };
  criteriaById.set(criterionId, criterion);
  return criterion;
}

function addComponent(components: string[], name: string): void {
  if (!components.includes(name)) {
    components.push(name);
  }
}
