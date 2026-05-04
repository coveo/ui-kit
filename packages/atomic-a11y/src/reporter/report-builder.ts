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
  packageMetadata: PackageMetadata
): A11yReport {
  const components = buildComponents(componentResults);
  const criteria = buildCriteria(componentResults);
  const hasInteractiveData = [...componentResults.values()].some(
    (c) => c.interactive !== undefined
  );

  const axeCoreVersion =
    packageMetadata.devDependencies?.['axe-core'] ??
    packageMetadata.dependencies?.['axe-core'];

  const storybookVersion =
    packageMetadata.devDependencies?.storybook ??
    packageMetadata.dependencies?.storybook;

  if (!axeCoreVersion) {
    throw new Error('axe-core version not found in package metadata');
  }

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
          incompleteDetails: component.automated.incompleteDetails,
        },
        interactive: component.interactive
          ? {
              criteriaCovered: [...component.interactive.criteriaCovered].sort(
                compareByNumericId
              ),
              testCount: component.interactive.testCount,
              passedCount: component.interactive.passedCount,
              failedCount: component.interactive.failedCount,
              failedCriteria: [...component.interactive.failedCriteria].sort(
                compareByNumericId
              ),
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
      addAffectedComponent(criterion, component.name);
    }

    if (component.interactive) {
      for (const criterionId of component.interactive.criteriaCovered) {
        const criterion = getOrCreateCriterion(criteriaById, criterionId);
        criterion.interactiveCoverage = true;
        addAffectedComponent(criterion, component.name);

        const isFailed = component.interactive.failedCriteria.has(criterionId);
        const isPassed = component.interactive.passedCriteria.has(criterionId);
        if (!isFailed && !isPassed) {
          continue;
        }

        const nextStatus: 'passed' | 'failed' = isFailed ? 'failed' : 'passed';
        const currentStatus = criterion.interactiveStatus;

        if (!currentStatus) {
          criterion.interactiveStatus = nextStatus;
          continue;
        }

        if (currentStatus !== nextStatus) {
          criterion.interactiveStatus = 'mixed';
        }
      }
    }
  }

  const criteria = [...criteriaById.values()];
  for (const criterion of criteria) {
    criterion.affectedComponents.sort(compareByName);
  }

  return criteria.sort((first, second) =>
    compareByNumericId(first.id, second.id)
  );
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
    // Conformance is intentionally deferred — the automated report only captures
    // coverage data, not the final judgment. The OpenACR pipeline (conformance.ts)
    // resolves actual conformance using: overrides → manual audit → interactive tests → automated results.
    conformance: 'notEvaluated',
    automatedCoverage: false,
    interactiveCoverage: false,
    manualVerified: false,
    affectedComponents: [],
  };
  criteriaById.set(criterionId, criterion);
  return criterion;
}

function addAffectedComponent(
  criterion: A11yCriterionReport,
  componentName: string
): void {
  if (!criterion.affectedComponents.includes(componentName)) {
    criterion.affectedComponents.push(componentName);
  }
}
