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
  totalCriteria: number,
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
      version: packageMetadata.version ?? '3.x.x',
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
    summary: createSummary(components, criteria, totalCriteria),
  };
}

function buildComponents(
  componentResults: Map<string, ComponentAccumulator>
): A11yComponentReport[] {
  return [...componentResults.values()]
    .map((component): A11yComponentReport => {
      return {
        name: component.name,
        category: component.category,
        framework: component.framework,
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
        conformance: 'notEvaluated',
        automatedCoverage: true,
        interactiveCoverage: interactiveCriteriaIds.has(criterionId),
        manualVerified: false,
        remarks: '',
        affectedComponents: [...coveredComponents].sort(compareByName),
      };
    })
    .sort((first, second) => compareByNumericId(first.id, second.id));
}
