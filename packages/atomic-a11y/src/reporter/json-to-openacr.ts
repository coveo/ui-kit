import {mkdir, readFile, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {buildRemarks, resolveConformance} from '../openacr/conformance.js';
import {
  isValidManualBaselineEntry,
  loadManualAuditData,
  parseManualBaseline,
  resolveManualConformance,
} from '../openacr/manual-audit.js';
import {loadOverrides} from '../openacr/overrides.js';
import {buildOpenAcrReport} from '../openacr/report-builder.js';
import type {OpenAcrReport} from '../openacr/types.js';
import {toYAML} from '../openacr/yaml-serializer.js';
import {wasExecutedDirectly} from '../shared/file-utils.js';
import {isA11yReport, isRecord} from '../shared/guards.js';
import type {A11yReport} from '../shared/types.js';
import {
  DEFAULT_A11Y_REPORT_FILENAME,
  DEFAULT_A11Y_REPORT_OUTPUT_DIR,
} from './vitest-a11y-reporter.js';

const DEFAULT_OPENACR_OUTPUT_FILENAME = 'openacr.yaml';
const DEFAULT_OVERRIDES_FILENAME = 'a11y-overrides.json';
const DEFAULT_OVERRIDES_DIR = 'a11y';
const DEFAULT_MANUAL_AUDIT_DIR = 'a11y/reports';

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
  const overrides = await loadOverrides(overridesFile);

  if (overrides.size > 0) {
    console.log(
      `[json-to-openacr] Loaded ${overrides.size} conformance override(s) from ${overridesFile}.`
    );
  }

  const manualAggregates = await loadManualAuditData(DEFAULT_MANUAL_AUDIT_DIR);

  const openAcrReport = buildOpenAcrReport(report, overrides, manualAggregates);
  const serialized = toYAML(openAcrReport);

  await mkdir(path.dirname(outputFile), {recursive: true});
  await writeFile(outputFile, serialized, 'utf8');

  return openAcrReport;
}

async function runFromCli(): Promise<void> {
  const result = await transformJsonToOpenAcr();

  console.log(
    `[json-to-openacr] Wrote ${result.summary.total_criteria} WCAG criteria to ${path.join(DEFAULT_A11Y_REPORT_OUTPUT_DIR, DEFAULT_OPENACR_OUTPUT_FILENAME)}.`
  );
}

export {
  buildRemarks,
  resolveConformance,
} from '../openacr/conformance.js';
export {
  isValidManualBaselineEntry,
  loadManualAuditData as readManualAuditBaselines,
  parseManualBaseline,
  resolveManualConformance,
} from '../openacr/manual-audit.js';

export const jsonToOpenAcrTestUtils = {
  buildRemarks,
  isValidManualBaselineEntry,
  parseManualBaseline,
  readManualAuditBaselines: loadManualAuditData,
  resolveConformance,
  resolveManualConformance,
};

if (wasExecutedDirectly()) {
  void runFromCli();
}
