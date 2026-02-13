import {mkdir, readdir, readFile, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import type {
  A11yComponentReport,
  A11yCriterionReport,
  A11yReport,
} from './vitest-a11y-reporter';
import {
  DEFAULT_A11Y_REPORT_FILENAME,
  DEFAULT_A11Y_REPORT_OUTPUT_DIR,
} from './vitest-a11y-reporter';

const DEFAULT_OPENACR_OUTPUT_FILENAME = 'openacr.yaml';
const DEFAULT_OVERRIDES_FILENAME = 'a11y-overrides.json';
const DEFAULT_OVERRIDES_DIR = 'a11y';
const DEFAULT_MANUAL_AUDIT_DIR = 'a11y/reports';
const DEFAULT_REPORT_TITLE = 'Coveo Accessibility Conformance Report';
const DEFAULT_REPORT_PRODUCT_NAME = 'Coveo Atomic';
const DEFAULT_REPORT_PRODUCT_VERSION = '3.x.x';
const DEFAULT_REPORT_DATE = new Date().toISOString().slice(0, 10);
const DEFAULT_REPORT_STANDARD = 'WCAG 2.2 AA';
const DEFAULT_REPORT_STANDARD_REFERENCE = 'https://www.w3.org/TR/WCAG22/';
const DEFAULT_MANUAL_PLACEHOLDER_NOTE =
  'Manual audit pending. Phase 3 results will be merged into this report.';

const VALID_OVERRIDE_CONFORMANCE_VALUES: ReadonlySet<OpenAcrConformance> =
  new Set([
    'supports',
    'partially-supports',
    'does-not-support',
    'not-applicable',
    'not-evaluated',
  ]);

const BASELINE_FILE_PATTERN = /^manual-audit-(?!.*-violations)([\w-]+)\.json$/;
const CRITERION_KEY_REGEX = /^(\d+(?:\.\d+)+)-/;

const manualStatusToConformance: Record<string, OpenAcrConformance> = {
  pass: 'supports',
  fail: 'does-not-support',
  partial: 'partially-supports',
  'not-applicable': 'not-applicable',
};

type ChapterId = 'success_criteria_level_a' | 'success_criteria_level_aa';
type CriterionLevel = 'A' | 'AA';

type OpenAcrConformance =
  | 'supports'
  | 'partially-supports'
  | 'does-not-support'
  | 'not-applicable'
  | 'not-evaluated';

interface WcagCriterionDefinition {
  id: string;
  handle: string;
  level: CriterionLevel;
  chapterId: ChapterId;
}

interface CriterionAggregate {
  coveredComponents: Set<string>;
  violatingComponents: Set<string>;
}

interface A11yOverrideEntry {
  criterion: string;
  conformance: OpenAcrConformance;
  reason: string;
}

interface ManualAuditBaselineEntry {
  name: string;
  category: string;
  manual: {
    status: string;
    wcag22Criteria: Record<string, string>;
  };
}

interface ManualAuditAggregate {
  componentName: string;
  criterionId: string;
  conformance: OpenAcrConformance;
}

interface OpenAcrCriterionComponent {
  name: string;
  adherence: {
    level: OpenAcrConformance;
    notes: string;
  };
}

interface OpenAcrCriterion {
  num: string;
  handle: string;
  level: CriterionLevel;
  conformance: OpenAcrConformance;
  remarks: string;
  affected_components: string[];
  automated_result: {
    status: 'not-covered' | 'covered-no-violations' | 'covered-with-violations';
    covered_components: string[];
    violating_components: string[];
  };
  manual_result: {
    status: string;
    notes: string;
  };
  components: OpenAcrCriterionComponent[];
}

interface OpenAcrChapter {
  notes: string;
  criteria: OpenAcrCriterion[];
}

interface OpenAcrReport {
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
  standards: Array<{
    standard_name: string;
    standard_ref: string;
    chapters: Array<{chapter_id: ChapterId; chapter_name: string}>;
  }>;
  summary: {
    total_criteria: number;
    supports: number;
    partially_supports: number;
    does_not_support: number;
    not_applicable: number;
    not_evaluated: number;
    automated_covered_criteria: number;
  };
  chapters: {
    success_criteria_level_a: OpenAcrChapter;
    success_criteria_level_aa: OpenAcrChapter;
    success_criteria_level_aaa: {
      disabled: true;
    };
  };
}

const reportConformanceToOpenAcr: Record<
  A11yCriterionReport['conformance'],
  OpenAcrConformance
> = {
  supports: 'supports',
  partiallySupports: 'partially-supports',
  doesNotSupport: 'does-not-support',
  notApplicable: 'not-applicable',
  notEvaluated: 'not-evaluated',
};

const wcagCriteriaDefinitions: WcagCriterionDefinition[] = [
  {
    id: '1.1.1',
    handle: 'Non-text Content',
    level: 'A',
    chapterId: 'success_criteria_level_a',
  },
  {
    id: '1.2.1',
    handle: 'Audio-only and Video-only (Prerecorded)',
    level: 'A',
    chapterId: 'success_criteria_level_a',
  },
  {
    id: '1.2.2',
    handle: 'Captions (Prerecorded)',
    level: 'A',
    chapterId: 'success_criteria_level_a',
  },
  {
    id: '1.2.3',
    handle: 'Audio Description or Media Alternative (Prerecorded)',
    level: 'A',
    chapterId: 'success_criteria_level_a',
  },
  {
    id: '1.3.1',
    handle: 'Info and Relationships',
    level: 'A',
    chapterId: 'success_criteria_level_a',
  },
  {
    id: '1.3.2',
    handle: 'Meaningful Sequence',
    level: 'A',
    chapterId: 'success_criteria_level_a',
  },
  {
    id: '1.3.3',
    handle: 'Sensory Characteristics',
    level: 'A',
    chapterId: 'success_criteria_level_a',
  },
  {
    id: '1.4.1',
    handle: 'Use of Color',
    level: 'A',
    chapterId: 'success_criteria_level_a',
  },
  {
    id: '1.4.2',
    handle: 'Audio Control',
    level: 'A',
    chapterId: 'success_criteria_level_a',
  },
  {
    id: '2.1.1',
    handle: 'Keyboard',
    level: 'A',
    chapterId: 'success_criteria_level_a',
  },
  {
    id: '2.1.2',
    handle: 'No Keyboard Trap',
    level: 'A',
    chapterId: 'success_criteria_level_a',
  },
  {
    id: '2.1.4',
    handle: 'Character Key Shortcuts',
    level: 'A',
    chapterId: 'success_criteria_level_a',
  },
  {
    id: '2.2.1',
    handle: 'Timing Adjustable',
    level: 'A',
    chapterId: 'success_criteria_level_a',
  },
  {
    id: '2.2.2',
    handle: 'Pause, Stop, Hide',
    level: 'A',
    chapterId: 'success_criteria_level_a',
  },
  {
    id: '2.3.1',
    handle: 'Three Flashes or Below Threshold',
    level: 'A',
    chapterId: 'success_criteria_level_a',
  },
  {
    id: '2.4.1',
    handle: 'Bypass Blocks',
    level: 'A',
    chapterId: 'success_criteria_level_a',
  },
  {
    id: '2.4.2',
    handle: 'Page Titled',
    level: 'A',
    chapterId: 'success_criteria_level_a',
  },
  {
    id: '2.4.3',
    handle: 'Focus Order',
    level: 'A',
    chapterId: 'success_criteria_level_a',
  },
  {
    id: '2.4.4',
    handle: 'Link Purpose (In Context)',
    level: 'A',
    chapterId: 'success_criteria_level_a',
  },
  {
    id: '2.5.1',
    handle: 'Pointer Gestures',
    level: 'A',
    chapterId: 'success_criteria_level_a',
  },
  {
    id: '2.5.2',
    handle: 'Pointer Cancellation',
    level: 'A',
    chapterId: 'success_criteria_level_a',
  },
  {
    id: '2.5.3',
    handle: 'Label in Name',
    level: 'A',
    chapterId: 'success_criteria_level_a',
  },
  {
    id: '2.5.4',
    handle: 'Motion Actuation',
    level: 'A',
    chapterId: 'success_criteria_level_a',
  },
  {
    id: '3.1.1',
    handle: 'Language of Page',
    level: 'A',
    chapterId: 'success_criteria_level_a',
  },
  {
    id: '3.2.1',
    handle: 'On Focus',
    level: 'A',
    chapterId: 'success_criteria_level_a',
  },
  {
    id: '3.2.2',
    handle: 'On Input',
    level: 'A',
    chapterId: 'success_criteria_level_a',
  },
  {
    id: '3.2.6',
    handle: 'Consistent Help',
    level: 'A',
    chapterId: 'success_criteria_level_a',
  },
  {
    id: '3.3.1',
    handle: 'Error Identification',
    level: 'A',
    chapterId: 'success_criteria_level_a',
  },
  {
    id: '3.3.2',
    handle: 'Labels or Instructions',
    level: 'A',
    chapterId: 'success_criteria_level_a',
  },
  {
    id: '3.3.7',
    handle: 'Redundant Entry',
    level: 'A',
    chapterId: 'success_criteria_level_a',
  },
  {
    id: '4.1.1',
    handle: 'Parsing',
    level: 'A',
    chapterId: 'success_criteria_level_a',
  },
  {
    id: '4.1.2',
    handle: 'Name, Role, Value',
    level: 'A',
    chapterId: 'success_criteria_level_a',
  },
  {
    id: '1.2.4',
    handle: 'Captions (Live)',
    level: 'AA',
    chapterId: 'success_criteria_level_aa',
  },
  {
    id: '1.2.5',
    handle: 'Audio Description (Prerecorded)',
    level: 'AA',
    chapterId: 'success_criteria_level_aa',
  },
  {
    id: '1.3.4',
    handle: 'Orientation',
    level: 'AA',
    chapterId: 'success_criteria_level_aa',
  },
  {
    id: '1.3.5',
    handle: 'Identify Input Purpose',
    level: 'AA',
    chapterId: 'success_criteria_level_aa',
  },
  {
    id: '1.4.3',
    handle: 'Contrast (Minimum)',
    level: 'AA',
    chapterId: 'success_criteria_level_aa',
  },
  {
    id: '1.4.4',
    handle: 'Resize Text',
    level: 'AA',
    chapterId: 'success_criteria_level_aa',
  },
  {
    id: '1.4.5',
    handle: 'Images of Text',
    level: 'AA',
    chapterId: 'success_criteria_level_aa',
  },
  {
    id: '1.4.10',
    handle: 'Reflow',
    level: 'AA',
    chapterId: 'success_criteria_level_aa',
  },
  {
    id: '1.4.11',
    handle: 'Non-text Contrast',
    level: 'AA',
    chapterId: 'success_criteria_level_aa',
  },
  {
    id: '1.4.12',
    handle: 'Text Spacing',
    level: 'AA',
    chapterId: 'success_criteria_level_aa',
  },
  {
    id: '1.4.13',
    handle: 'Content on Hover or Focus',
    level: 'AA',
    chapterId: 'success_criteria_level_aa',
  },
  {
    id: '2.4.5',
    handle: 'Multiple Ways',
    level: 'AA',
    chapterId: 'success_criteria_level_aa',
  },
  {
    id: '2.4.6',
    handle: 'Headings and Labels',
    level: 'AA',
    chapterId: 'success_criteria_level_aa',
  },
  {
    id: '2.4.7',
    handle: 'Focus Visible',
    level: 'AA',
    chapterId: 'success_criteria_level_aa',
  },
  {
    id: '2.4.11',
    handle: 'Focus Not Obscured (Minimum)',
    level: 'AA',
    chapterId: 'success_criteria_level_aa',
  },
  {
    id: '2.5.7',
    handle: 'Dragging Movements',
    level: 'AA',
    chapterId: 'success_criteria_level_aa',
  },
  {
    id: '2.5.8',
    handle: 'Target Size (Minimum)',
    level: 'AA',
    chapterId: 'success_criteria_level_aa',
  },
  {
    id: '3.1.2',
    handle: 'Language of Parts',
    level: 'AA',
    chapterId: 'success_criteria_level_aa',
  },
  {
    id: '3.2.3',
    handle: 'Consistent Navigation',
    level: 'AA',
    chapterId: 'success_criteria_level_aa',
  },
  {
    id: '3.2.4',
    handle: 'Consistent Identification',
    level: 'AA',
    chapterId: 'success_criteria_level_aa',
  },
  {
    id: '3.3.3',
    handle: 'Error Suggestion',
    level: 'AA',
    chapterId: 'success_criteria_level_aa',
  },
  {
    id: '3.3.4',
    handle: 'Error Prevention (Legal, Financial, Data)',
    level: 'AA',
    chapterId: 'success_criteria_level_aa',
  },
  {
    id: '3.3.8',
    handle: 'Accessible Authentication (Minimum)',
    level: 'AA',
    chapterId: 'success_criteria_level_aa',
  },
  {
    id: '4.1.3',
    handle: 'Status Messages',
    level: 'AA',
    chapterId: 'success_criteria_level_aa',
  },
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isA11yReport(value: unknown): value is A11yReport {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isRecord(value.report) &&
    Array.isArray(value.components) &&
    Array.isArray(value.criteria) &&
    isRecord(value.summary)
  );
}

function sortStrings(first: string, second: string): number {
  return first.localeCompare(second, 'en-US', {numeric: true});
}

function mapCriterionConformance(
  criterion: A11yCriterionReport | undefined
): OpenAcrConformance | null {
  if (!criterion) {
    return null;
  }

  return reportConformanceToOpenAcr[criterion.conformance] ?? null;
}

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

function resolveAutomatedConformance(
  aggregate: CriterionAggregate | undefined
): OpenAcrConformance {
  const coveredCount = aggregate?.coveredComponents.size ?? 0;
  if (coveredCount === 0) {
    return 'not-evaluated';
  }

  const violatingCount = aggregate?.violatingComponents.size ?? 0;
  if (violatingCount === 0) {
    return 'supports';
  }

  if (violatingCount >= coveredCount) {
    return 'does-not-support';
  }

  return 'partially-supports';
}

function isValidOverrideEntry(entry: unknown): entry is A11yOverrideEntry {
  if (!isRecord(entry)) {
    return false;
  }

  return (
    typeof entry.criterion === 'string' &&
    typeof entry.conformance === 'string' &&
    VALID_OVERRIDE_CONFORMANCE_VALUES.has(
      entry.conformance as OpenAcrConformance
    ) &&
    typeof entry.reason === 'string' &&
    entry.reason.length > 0
  );
}

function parseOverrides(
  content: string,
  filePath: string
): Map<string, A11yOverrideEntry> {
  const overrides = new Map<string, A11yOverrideEntry>();

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    console.warn(
      `[json-to-openacr] Unable to parse overrides file ${filePath} as JSON.`
    );
    return overrides;
  }

  if (!isRecord(parsed) || !Array.isArray(parsed.overrides)) {
    console.warn(
      `[json-to-openacr] Overrides file ${filePath} does not contain a valid "overrides" array.`
    );
    return overrides;
  }

  for (const entry of parsed.overrides) {
    if (!isValidOverrideEntry(entry)) {
      console.warn(`[json-to-openacr] Skipping invalid override entry:`, entry);
      continue;
    }

    overrides.set(entry.criterion, entry);
  }

  return overrides;
}

async function readOverridesFile(
  filePath: string
): Promise<Map<string, A11yOverrideEntry>> {
  try {
    const content = await readFile(filePath, 'utf8');
    return parseOverrides(content, filePath);
  } catch (error) {
    const errorCode =
      isRecord(error) && typeof error.code === 'string'
        ? error.code
        : undefined;

    if (errorCode === 'ENOENT') {
      return new Map();
    }

    console.warn(
      `[json-to-openacr] Unable to read overrides file ${filePath}.`,
      error
    );
    return new Map();
  }
}

function isValidManualBaselineEntry(
  entry: unknown
): entry is ManualAuditBaselineEntry {
  return (
    isRecord(entry) &&
    typeof entry.name === 'string' &&
    entry.name.length > 0 &&
    isRecord(entry.manual) &&
    typeof entry.manual.status === 'string' &&
    isRecord(entry.manual.wcag22Criteria)
  );
}

function parseManualBaseline(
  content: string,
  filePath: string
): Map<string, ManualAuditAggregate[]> {
  const aggregates = new Map<string, ManualAuditAggregate[]>();

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    console.warn(
      `[json-to-openacr] Unable to parse manual baseline file ${filePath} as JSON.`
    );
    return aggregates;
  }

  if (!Array.isArray(parsed)) {
    console.warn(
      `[json-to-openacr] Manual baseline file ${filePath} does not contain a valid array of entries.`
    );
    return aggregates;
  }

  for (const entry of parsed) {
    if (!isValidManualBaselineEntry(entry)) {
      console.warn(
        `[json-to-openacr] Skipping invalid manual baseline entry:`,
        entry
      );
      continue;
    }

    if (entry.manual.status !== 'complete') {
      continue;
    }

    for (const [criterionKey, statusValue] of Object.entries(
      entry.manual.wcag22Criteria
    )) {
      if (typeof statusValue !== 'string') {
        continue;
      }

      const match = criterionKey.match(CRITERION_KEY_REGEX);
      if (!match) {
        continue;
      }

      const criterionId = match[1];
      const conformance = manualStatusToConformance[statusValue];

      if (!conformance) {
        console.warn(
          `[json-to-openacr] Unknown manual status "${statusValue}" for criterion ${criterionId} in component ${entry.name}.`
        );
        continue;
      }

      const aggregate: ManualAuditAggregate = {
        componentName: entry.name,
        criterionId,
        conformance,
      };

      const key = `${entry.name}:${criterionId}`;
      const existing = aggregates.get(key) ?? [];
      aggregates.set(key, [...existing, aggregate]);
    }
  }

  return aggregates;
}

async function readManualAuditBaselines(
  dirPath: string
): Promise<Map<string, ManualAuditAggregate[]>> {
  const allAggregates = new Map<string, ManualAuditAggregate[]>();
  let loadedCount = 0;
  let fileCount = 0;

  try {
    const files = await readdir(dirPath);
    const baselineFiles = files.filter((file) =>
      BASELINE_FILE_PATTERN.test(file)
    );
    fileCount = baselineFiles.length;

    for (const file of baselineFiles) {
      const filePath = path.join(dirPath, file);
      try {
        const content = await readFile(filePath, 'utf8');
        const aggregates = parseManualBaseline(content, filePath);

        for (const [key, entries] of aggregates) {
          const existing = allAggregates.get(key) ?? [];
          allAggregates.set(key, [...existing, ...entries]);
          loadedCount += entries.length;
        }
      } catch (error) {
        console.warn(
          `[json-to-openacr] Unable to read manual baseline file ${filePath}.`,
          error
        );
      }
    }
  } catch (error) {
    const errorCode =
      isRecord(error) && typeof error.code === 'string'
        ? error.code
        : undefined;

    if (errorCode === 'ENOENT') {
      return new Map();
    }

    console.warn(
      `[json-to-openacr] Unable to read manual audit directory ${dirPath}.`,
      error
    );
    return new Map();
  }

  if (loadedCount > 0) {
    const criteriaSet = new Set<string>();
    for (const key of allAggregates.keys()) {
      const [, criterionId] = key.split(':');
      criteriaSet.add(criterionId);
    }
    console.log(
      `[json-to-openacr] Loaded ${loadedCount} manual audit entries across ${criteriaSet.size} criteria from ${fileCount} baseline file(s).`
    );
  }

  return allAggregates;
}

function resolveManualConformance(
  manualAggregates: ManualAuditAggregate[] | undefined
): OpenAcrConformance | undefined {
  if (!manualAggregates || manualAggregates.length === 0) {
    return undefined;
  }

  // Count conformances to apply precedence: fail > partial > pass > not-applicable
  let failCount = 0;
  let partialCount = 0;
  let passCount = 0;
  let notApplicableCount = 0;

  for (const aggregate of manualAggregates) {
    switch (aggregate.conformance) {
      case 'does-not-support':
        failCount++;
        break;
      case 'partially-supports':
        partialCount++;
        break;
      case 'supports':
        passCount++;
        break;
      case 'not-applicable':
        notApplicableCount++;
        break;
    }
  }

  // Apply resolution precedence
  if (failCount > 0) {
    return 'does-not-support';
  }
  if (partialCount > 0) {
    return 'partially-supports';
  }
  if (passCount > 0) {
    return 'supports';
  }
  if (notApplicableCount > 0) {
    return 'not-applicable';
  }

  return undefined;
}

function resolveConformance(
  criterion: A11yCriterionReport | undefined,
  aggregate: CriterionAggregate | undefined,
  manualAggregate: ManualAuditAggregate[] | undefined,
  override: A11yOverrideEntry | undefined
): OpenAcrConformance {
  if (override) {
    return override.conformance;
  }

  const manualConformance = resolveManualConformance(manualAggregate);
  if (manualConformance) {
    return manualConformance;
  }

  const existingConformance = mapCriterionConformance(criterion);

  if (existingConformance && existingConformance !== 'not-evaluated') {
    return existingConformance;
  }

  return resolveAutomatedConformance(aggregate);
}

function buildRemarks(
  criterionId: string,
  conformance: OpenAcrConformance,
  coveredComponents: string[],
  violatingComponents: string[],
  manualAggregates: ManualAuditAggregate[] | undefined,
  override: A11yOverrideEntry | undefined
): string {
  if (override) {
    return `[Override] ${override.reason}`;
  }

  if (manualAggregates && manualAggregates.length > 0) {
    let passCount = 0;
    let failCount = 0;
    let partialCount = 0;
    let notApplicableCount = 0;

    for (const aggregate of manualAggregates) {
      switch (aggregate.conformance) {
        case 'supports':
          passCount++;
          break;
        case 'does-not-support':
          failCount++;
          break;
        case 'partially-supports':
          partialCount++;
          break;
        case 'not-applicable':
          notApplicableCount++;
          break;
      }
    }

    const componentsCount = manualAggregates.length;
    const summaryParts: string[] = [];
    if (passCount > 0) summaryParts.push(`${passCount} pass`);
    if (failCount > 0) summaryParts.push(`${failCount} fail`);
    if (partialCount > 0) summaryParts.push(`${partialCount} partial`);
    if (notApplicableCount > 0)
      summaryParts.push(`${notApplicableCount} not-applicable`);

    const summary = summaryParts.join(', ');
    return `Manual audit: ${summary} across ${componentsCount} component(s).`;
  }

  const coveredCount = coveredComponents.length;
  const violatingCount = violatingComponents.length;

  if (conformance === 'supports') {
    return `Automated testing found no axe-core violations for WCAG ${criterionId} across ${coveredCount} mapped component(s). ${DEFAULT_MANUAL_PLACEHOLDER_NOTE}`;
  }

  if (conformance === 'partially-supports') {
    return `Automated testing found violations for WCAG ${criterionId} in ${violatingCount} of ${coveredCount} mapped component(s). ${DEFAULT_MANUAL_PLACEHOLDER_NOTE}`;
  }

  if (conformance === 'does-not-support') {
    return `Automated testing found violations for WCAG ${criterionId} in all ${coveredCount} mapped component(s). ${DEFAULT_MANUAL_PLACEHOLDER_NOTE}`;
  }

  if (conformance === 'not-applicable') {
    return `WCAG ${criterionId} is not applicable for the tested component scope.`;
  }

  return `WCAG ${criterionId} has no automated mapping evidence in the JSON report. ${DEFAULT_MANUAL_PLACEHOLDER_NOTE}`;
}

function buildCriterionComponents(
  conformance: OpenAcrConformance,
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
  const criteriaById = new Map<string, A11yCriterionReport>(
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
      sortStrings
    );
    const violatingComponents = [
      ...(aggregate?.violatingComponents ?? []),
    ].sort(sortStrings);

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

function buildOpenAcrReport(
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

type YamlScalar = string | number | boolean | null;

function isYamlScalar(value: unknown): value is YamlScalar {
  return (
    value === null ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  );
}

function stringifyYamlScalar(value: YamlScalar): string {
  if (value === null) {
    return 'null';
  }

  if (typeof value === 'string') {
    return JSON.stringify(value);
  }

  return String(value);
}

function renderYaml(value: unknown, indentationLevel = 0): string[] {
  const indentation = '  '.repeat(indentationLevel);

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return [`${indentation}[]`];
    }

    const lines: string[] = [];

    for (const entry of value) {
      if (isYamlScalar(entry)) {
        lines.push(`${indentation}- ${stringifyYamlScalar(entry)}`);
        continue;
      }

      const renderedEntry = renderYaml(entry, indentationLevel + 1);
      const [firstLine, ...remainingLines] = renderedEntry;
      lines.push(`${indentation}- ${firstLine.trimStart()}`);
      lines.push(...remainingLines);
    }

    return lines;
  }

  if (isRecord(value)) {
    const entries = Object.entries(value).filter(
      ([, entryValue]) => entryValue !== undefined
    );

    if (entries.length === 0) {
      return [`${indentation}{}`];
    }

    const lines: string[] = [];

    for (const [key, entryValue] of entries) {
      if (entryValue === undefined) {
        continue;
      }

      if (Array.isArray(entryValue) && entryValue.length === 0) {
        lines.push(`${indentation}${key}: []`);
        continue;
      }

      if (
        isRecord(entryValue) &&
        Object.entries(entryValue).filter(
          ([, nestedValue]) => nestedValue !== undefined
        ).length === 0
      ) {
        lines.push(`${indentation}${key}: {}`);
        continue;
      }

      if (isYamlScalar(entryValue)) {
        lines.push(`${indentation}${key}: ${stringifyYamlScalar(entryValue)}`);
        continue;
      }

      lines.push(`${indentation}${key}:`);
      lines.push(...renderYaml(entryValue, indentationLevel + 1));
    }

    return lines;
  }

  if (isYamlScalar(value)) {
    return [`${indentation}${stringifyYamlScalar(value)}`];
  }

  return [`${indentation}${JSON.stringify(value)}`];
}

function serializeToYaml(value: unknown): string {
  return `${renderYaml(value).join('\n')}\n`;
}

async function readInputReport(
  inputFilePath: string
): Promise<A11yReport | null> {
  try {
    const fileContents = await readFile(inputFilePath, 'utf8');
    const parsed = JSON.parse(fileContents) as unknown;

    if (!isA11yReport(parsed)) {
      console.warn(
        `[json-to-openacr] Invalid JSON structure in ${inputFilePath}. Falling back to placeholders.`
      );
      return null;
    }

    return parsed;
  } catch (error) {
    const errorCode =
      isRecord(error) && typeof error.code === 'string'
        ? error.code
        : undefined;

    if (errorCode === 'ENOENT') {
      console.warn(
        `[json-to-openacr] Input report not found at ${inputFilePath}. Writing placeholder OpenACR output.`
      );
      return null;
    }

    console.warn(
      `[json-to-openacr] Unable to read input report ${inputFilePath}. Falling back to placeholders.`,
      error
    );

    return null;
  }
}

export interface JsonToOpenAcrOptions {
  inputFile?: string;
  outputFile?: string;
  overridesFile?: string;
  manualAuditDir?: string;
}

/**
 * Transforms the accessibility JSON report into an OpenACR-compatible YAML report.
 *
 * If an overrides file exists (default: `a11y/a11y-overrides.json`), its entries
 * take precedence over automated conformance results. Use overrides to mark criteria
 * as `not-applicable` or to manually set conformance when axe-core cannot evaluate them.
 */
export async function transformJsonToOpenAcr(
  options: JsonToOpenAcrOptions = {}
): Promise<OpenAcrReport> {
  const inputFile = path.resolve(
    options.inputFile ??
      path.join(DEFAULT_A11Y_REPORT_OUTPUT_DIR, DEFAULT_A11Y_REPORT_FILENAME)
  );
  const outputFile = path.resolve(
    options.outputFile ??
      path.join(DEFAULT_A11Y_REPORT_OUTPUT_DIR, DEFAULT_OPENACR_OUTPUT_FILENAME)
  );
  const overridesFile = path.resolve(
    options.overridesFile ??
      path.join(DEFAULT_OVERRIDES_DIR, DEFAULT_OVERRIDES_FILENAME)
  );

  const report = await readInputReport(inputFile);
  const overrides = await readOverridesFile(overridesFile);

  if (overrides.size > 0) {
    console.log(
      `[json-to-openacr] Loaded ${overrides.size} conformance override(s) from ${overridesFile}.`
    );
  }

  const manualAggregates = await readManualAuditBaselines(
    DEFAULT_MANUAL_AUDIT_DIR
  );

  const openAcrReport = buildOpenAcrReport(report, overrides, manualAggregates);
  const serialized = serializeToYaml(openAcrReport);

  await mkdir(path.dirname(outputFile), {recursive: true});
  await writeFile(outputFile, serialized, 'utf8');

  return openAcrReport;
}

function wasExecutedDirectly(): boolean {
  const currentFilePath = fileURLToPath(import.meta.url);
  const entryFile = process.argv[1];

  if (!entryFile) {
    return false;
  }

  return path.resolve(entryFile) === currentFilePath;
}

async function runFromCli(): Promise<void> {
  const result = await transformJsonToOpenAcr();

  console.log(
    `[json-to-openacr] Wrote ${result.summary.total_criteria} WCAG criteria to ${path.join(DEFAULT_A11Y_REPORT_OUTPUT_DIR, DEFAULT_OPENACR_OUTPUT_FILENAME)}.`
  );
}

if (wasExecutedDirectly()) {
  void runFromCli();
}
