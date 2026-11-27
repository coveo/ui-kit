import {isDeepStrictEqual} from 'node:util';
import {parse, stringify} from 'yaml';
import {isRecord} from '../shared/guards.js';
import type {OpenAcrReport} from './types.js';

/**
 * Returns today's date in the `YYYY-MM-DD` format used by OpenACR dates.
 */
function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

// Both sides go through the same YAML round trip, so a value the committed file
// cannot represent exactly does not count as an evaluation change.
function toPlainData(value: unknown): unknown {
  return parse(stringify(value, {version: '1.1', singleQuote: true}), {version: '1.1'});
}

// The fields that describe the evaluation itself. Everything else (product,
// author, vendor, notes...) is metadata: changing it is not a new evaluation.
function evaluationOf(report: OpenAcrReport): unknown {
  return toPlainData({
    evaluation_methods_used: report.evaluation_methods_used,
    catalog: report.catalog,
    chapters: report.chapters,
  });
}

function withoutDates(report: OpenAcrReport): unknown {
  const data = toPlainData(report);
  if (isRecord(data)) {
    delete data.report_date;
    delete data.last_modified_date;
  }
  return data;
}

/**
 * Picks the dates of a regenerated OpenACR report from the previously committed one.
 *
 * - `report_date` is the evaluation date. It changes only when the evaluation
 *   changes: conformance results, or the tools and versions listed in
 *   `evaluation_methods_used` (for example an axe-core upgrade).
 * - `last_modified_date` changes whenever the document changes, including
 *   when only metadata changes, such as the Atomic version (`product.version`).
 *
 * Without this, every regeneration would stamp both dates with the day it ran.
 *
 * @param previous - The previously committed report, if any (see `readOpenAcr`).
 * @param next - The freshly generated report, dated with the day it ran.
 */
export function reconcileReportDates(
  previous: OpenAcrReport | undefined,
  next: OpenAcrReport
): OpenAcrReport {
  if (!previous) {
    return next;
  }

  if (!isDeepStrictEqual(evaluationOf(previous), evaluationOf(next))) {
    return next;
  }

  const documentChanged = !isDeepStrictEqual(withoutDates(previous), withoutDates(next));
  return {
    ...next,
    report_date: previous.report_date,
    last_modified_date: documentChanged ? next.last_modified_date : previous.last_modified_date,
  };
}

/**
 * Sets the Atomic version of an OpenACR report without re-running the evaluation.
 *
 * Keeps `report_date`, since nothing was re-evaluated, and sets
 * `last_modified_date` to `today` when the version actually changes.
 *
 * @returns The updated report, and whether it differs from the input.
 */
export function syncProductVersion(
  report: OpenAcrReport,
  version: string,
  today: string = todayIsoDate()
): {report: OpenAcrReport; changed: boolean} {
  if (report.product.version === version) {
    return {report, changed: false};
  }
  return {
    report: {
      ...report,
      product: {...report.product, version},
      last_modified_date: today,
    },
    changed: true,
  };
}
