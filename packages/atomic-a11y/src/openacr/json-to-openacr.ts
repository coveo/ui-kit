import {mkdir, readFile, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {stringify} from 'yaml';
import {
  DEFAULT_A11Y_REPORT_FILENAME,
  DEFAULT_A11Y_REPORT_OUTPUT_DIR,
} from '../shared/constants.js';
import {isA11yReport, isRecord} from '../shared/guards.js';
import type {A11yReport} from '../shared/types.js';
import {loadManualAuditData} from './manual-audit.js';
import {loadOverrides} from './overrides.js';
import {buildOpenAcrReport} from './report-builder.js';
import type {OpenAcrReport} from './types.js';

const LOG_PREFIX = '[json-to-openacr]';
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
        LOG_PREFIX,
        `Invalid JSON structure in ${inputFilePath}. Falling back to placeholders.`
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
        LOG_PREFIX,
        `Input report not found at ${inputFilePath}. Writing placeholder OpenACR output.`
      );
      return null;
    }

    console.warn(
      LOG_PREFIX,
      `Unable to read input report ${inputFilePath}. Falling back to placeholders.`,
      error
    );

    return null;
  }
}

/**
 * Options for {@link transformJsonToOpenAcr}.
 */
export interface JsonToOpenAcrOptions {
  /** Path to the input `a11y-report.json` file.
   * @default 'reports/a11y-report.json' */
  inputFile?: string;
  /** Path where the OpenACR YAML output is written.
   * @default 'reports/openacr.yaml' */
  outputFile?: string;
  /** Path to a JSON file with per-criterion conformance overrides.
   * @default 'a11y/a11y-overrides.json' */
  overridesFile?: string;
  /** Directory containing `manual-audit-*.json` baseline files.
   * @default 'a11y/reports' */
  manualAuditDir?: string;
}

/**
 * Converts an `a11y-report.json` into an OpenACR-compliant YAML document.
 *
 * Reads the input report, loads optional manual audit baselines and conformance
 * overrides, resolves per-criterion conformance using a priority chain
 * (override → manual → existing → automated), and writes the result as YAML.
 *
 * If the input report is missing or invalid, a placeholder report with all
 * criteria set to `'not-evaluated'` is produced.
 *
 * @returns The assembled {@link OpenAcrReport} object (also written to disk as YAML).
 *
 * @example
 * ```ts
 * import { transformJsonToOpenAcr } from '@coveo/atomic-a11y';
 *
 * const report = await transformJsonToOpenAcr({
 *   inputFile: 'reports/a11y-report.json',
 *   outputFile: 'reports/openacr.yaml',
 * });
 * ```
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
  const overrides = await loadOverrides(overridesFile);

  if (overrides.size > 0) {
    console.log(
      LOG_PREFIX,
      `Loaded ${overrides.size} conformance override(s) from ${overridesFile}.`
    );
  }

  const manualAuditDir = path.resolve(
    options.manualAuditDir ?? DEFAULT_MANUAL_AUDIT_DIR
  );
  const manualAggregates = await loadManualAuditData(manualAuditDir);

  const openAcrReport = buildOpenAcrReport(report, overrides, manualAggregates);
  const serialized = stringify(openAcrReport);

  await mkdir(path.dirname(outputFile), {recursive: true});
  await writeFile(outputFile, serialized, 'utf8');

  return openAcrReport;
}
