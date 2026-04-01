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
  const criteriaToComponents = new Map<string, Set<string>>();
  const interactiveCriteriaIds = new Set<string>();
  const interactiveStatusMap = new Map<string, 'passed' | 'failed' | 'mixed'>();

  for (const component of componentResults.values()) {
    for (const criterion of component.automated.criteriaCovered) {
      const components =
        criteriaToComponents.get(criterion) ?? new Set<string>();
      components.add(component.name);
      criteriaToComponents.set(criterion, components);
    }

    if (component.interactive) {
      for (const criterion of component.interactive.criteriaCovered) {
        const components =
          criteriaToComponents.get(criterion) ?? new Set<string>();
        components.add(component.name);
        criteriaToComponents.set(criterion, components);
        interactiveCriteriaIds.add(criterion);

        const isFailed = component.interactive.failedCriteria.has(criterion);
        const isPassed = component.interactive.passedCriteria.has(criterion);
        if (!isFailed && !isPassed) {
          continue;
        }

        const nextStatus: 'passed' | 'failed' = isFailed ? 'failed' : 'passed';
        const currentStatus = interactiveStatusMap.get(criterion);

        if (!currentStatus) {
          interactiveStatusMap.set(criterion, nextStatus);
          continue;
        }

        if (currentStatus !== nextStatus) {
          interactiveStatusMap.set(criterion, 'mixed');
        }
      }
    }
  }

  return [...criteriaToComponents.entries()]
    .map(([criterionId, coveredComponents]): A11yCriterionReport => {
      const metadata = getCriterionMetadata(criterionId);

      return {
        id: criterionId,
        name: metadata.name,
        level: metadata.level,
        wcagVersion: metadata.wcagVersion,
        // Conformance is intentionally deferred — the automated report only captures
        // coverage data, not the final judgment. The OpenACR pipeline (conformance.ts)
        // resolves actual conformance using: overrides → manual audit → interactive tests → automated results.
        conformance: 'notEvaluated',
        automatedCoverage: true,
        interactiveCoverage: interactiveCriteriaIds.has(criterionId),
        interactiveStatus: interactiveStatusMap.get(criterionId),
        manualVerified: false,
        affectedComponents: [...coveredComponents].sort(compareByName),
      };
    })
    .sort((first, second) => compareByNumericId(first.id, second.id));
}
