import {isDeepStrictEqual} from 'node:util';
import {isRecord} from '../shared/guards.js';

/**
 * How a freshly generated OpenACR report differs from the committed one.
 *
 * - `none`: they are identical.
 * - `product-version`: only `product.version` (and with it `last_modified_date`)
 *   differs, so the committed file targets another Atomic version.
 * - `content`: the evaluation differs (conformance results, evaluation methods
 *   or anything else).
 */
export type OpenAcrDrift = 'none' | 'product-version' | 'content';

function withoutVersionStamp(report: unknown): unknown {
  if (!isRecord(report)) {
    return report;
  }
  const copy = structuredClone(report);
  delete copy.last_modified_date;
  if (isRecord(copy.product)) {
    delete copy.product.version;
  }
  return copy;
}

/**
 * Compares two parsed OpenACR reports. Generate the second one with the first
 * as its baseline (see `transformJsonToOpenAcr`'s `baselineFile`), so unchanged
 * evaluations keep the committed dates and the documents compare as a whole.
 */
export function detectOpenAcrDrift(committed: unknown, generated: unknown): OpenAcrDrift {
  if (isDeepStrictEqual(committed, generated)) {
    return 'none';
  }
  return isDeepStrictEqual(withoutVersionStamp(committed), withoutVersionStamp(generated))
    ? 'product-version'
    : 'content';
}
