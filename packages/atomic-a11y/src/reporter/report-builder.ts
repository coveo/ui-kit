import {resolveEvidenceOutcome} from '../shared/evidence.js';
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
  const criteria = buildCriteria(components);
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
        `Automated: axe-core ${axeCoreVersion} via Storybook addon-a11y`,
        ...(hasInteractiveData
          ? [
              'Interactive: Storybook interactive tests for keyboard navigation and focus management',
            ]
          : []),
        'Manual audit: keyboard-only testing; screen reader testing; visual inspection at 200% and 400% zoom; reflow verification at 320 CSS px viewport width; non-text contrast verification.',
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
              criteriaPassed: [...component.interactive.passedCriteria].sort(
                compareByNumericId
              ),
              criteriaFailed: [...component.interactive.failedCriteria].sort(
                compareByNumericId
              ),
              criteriaWarnings: [...component.interactive.warningCriteria].sort(
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

interface CriterionEvidence {
  report: A11yCriterionReport;
  automatedPassedComponents: Set<string>;
  automatedFailedComponents: Set<string>;
  interactivePassedComponents: Set<string>;
  interactiveFailedComponents: Set<string>;
}

const evidenceSeverity = {
  passed: 0,
  'partially-passed': 1,
  failed: 2,
} as const;

const reportConformance = {
  passed: 'supports',
  'partially-passed': 'partiallySupports',
  failed: 'doesNotSupport',
} as const;

const interactiveStatus = {
  passed: 'passed',
  'partially-passed': 'partiallyPassed',
  failed: 'failed',
} as const;

export function buildCriteria(
  components: A11yComponentReport[]
): A11yCriterionReport[] {
  const evidenceByCriterion = new Map<string, CriterionEvidence>();

  for (const component of components) {
    for (const criterionId of component.automated.criteriaCovered) {
      getOrCreateCriterion(evidenceByCriterion, criterionId);
    }

    for (const criterionId of component.automated.criteriaPassed) {
      const evidence = getOrCreateCriterion(evidenceByCriterion, criterionId);
      evidence.report.automatedCoverage = true;
      evidence.automatedPassedComponents.add(component.name);
    }

    for (const criterionId of component.automated.criteriaViolated) {
      const evidence = getOrCreateCriterion(evidenceByCriterion, criterionId);
      evidence.report.automatedCoverage = true;
      evidence.automatedFailedComponents.add(component.name);
    }

    if (!component.interactive) {
      continue;
    }

    for (const criterionId of component.interactive.criteriaCovered) {
      const evidence = getOrCreateCriterion(evidenceByCriterion, criterionId);
      evidence.report.interactiveCoverage = true;
    }

    for (const criterionId of component.interactive.criteriaPassed ?? []) {
      getOrCreateCriterion(
        evidenceByCriterion,
        criterionId
      ).interactivePassedComponents.add(component.name);
    }

    for (const criterionId of component.interactive.criteriaFailed ?? []) {
      getOrCreateCriterion(
        evidenceByCriterion,
        criterionId
      ).interactiveFailedComponents.add(component.name);
    }
  }

  return [...evidenceByCriterion.values()]
    .map(resolveCriterionEvidence)
    .sort((first, second) => compareByNumericId(first.id, second.id));
}

function resolveCriterionEvidence(
  evidence: CriterionEvidence
): A11yCriterionReport {
  const automatedOutcome = resolveEvidenceOutcome(
    evidence.automatedPassedComponents.size,
    evidence.automatedFailedComponents.size
  );
  const interactiveOutcome = resolveEvidenceOutcome(
    evidence.interactivePassedComponents.size,
    evidence.interactiveFailedComponents.size
  );
  const outcomes = [automatedOutcome, interactiveOutcome].filter(
    (outcome) => outcome !== null
  );
  const worstOutcome = outcomes.reduce(
    (worst, outcome) =>
      evidenceSeverity[outcome] > evidenceSeverity[worst] ? outcome : worst,
    'passed'
  );

  const passedComponents = new Set([
    ...evidence.automatedPassedComponents,
    ...evidence.interactivePassedComponents,
  ]);
  const failedComponents = new Set([
    ...evidence.automatedFailedComponents,
    ...evidence.interactiveFailedComponents,
  ]);
  const coveredComponents = new Set([...passedComponents, ...failedComponents]);

  return {
    ...evidence.report,
    conformance:
      outcomes.length > 0 ? reportConformance[worstOutcome] : 'doesNotSupport',
    interactiveStatus: interactiveOutcome
      ? interactiveStatus[interactiveOutcome]
      : undefined,
    coveredComponents: [...coveredComponents].sort(compareByName),
    violatingComponents: [...failedComponents].sort(compareByName),
  };
}

function getOrCreateCriterion(
  evidenceByCriterion: Map<string, CriterionEvidence>,
  criterionId: string
): CriterionEvidence {
  const existing = evidenceByCriterion.get(criterionId);
  if (existing) {
    return existing;
  }

  const metadata = getCriterionMetadata(criterionId);
  const evidence: CriterionEvidence = {
    report: {
      id: criterionId,
      name: metadata.name,
      level: metadata.level,
      wcagVersion: metadata.wcagVersion,
      conformance: 'doesNotSupport',
      automatedCoverage: false,
      interactiveCoverage: false,
      manualVerified: false,
      coveredComponents: [],
      violatingComponents: [],
    },
    automatedPassedComponents: new Set<string>(),
    automatedFailedComponents: new Set<string>(),
    interactivePassedComponents: new Set<string>(),
    interactiveFailedComponents: new Set<string>(),
  };
  evidenceByCriterion.set(criterionId, evidence);
  return evidence;
}
