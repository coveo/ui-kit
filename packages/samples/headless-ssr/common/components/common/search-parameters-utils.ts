import {RangeValueRequest} from '@coveo/headless/dist/definitions/features/facets/range-facets/generic/interfaces/range-facet';
import {type SearchParameters} from '@coveo/headless/ssr';
import {ReadonlyURLSearchParams} from 'next/navigation';

export type RangeFacetPair = [
  SearchParameterKey,
  Record<string, RangeValueRequest[]>,
];
export type FacetPair = [SearchParameterKey, Record<string, string[]>];
export type SearchParameterKey = keyof SearchParameters;
export type NextJSServerSideSearchParamsValues = string | string[] | undefined;
export type NextJSServerSideSearchParams = Record<
  string,
  NextJSServerSideSearchParamsValues
>;

export function isObject(obj: unknown): obj is object {
  return obj && typeof obj === 'object' ? true : false;
}

export function allEntriesAreValid(
  obj: object,
  isValidValue: (v: unknown) => boolean
) {
  const invalidEntries = Object.entries(obj).filter((entry) => {
    const values = entry[1];
    return !Array.isArray(values) || !values.every(isValidValue);
  });

  return invalidEntries.length === 0;
}

export function isValidKey(key: string): key is SearchParameterKey {
  const supportedParameters: Record<keyof Required<SearchParameters>, boolean> =
    {
      q: true,
      aq: true,
      cq: true,
      enableQuerySyntax: true,
      firstResult: true,
      numberOfResults: true,
      sortCriteria: true,
      f: true,
      fExcluded: true,
      cf: true,
      nf: true,
      df: true,
      debug: true,
      sf: true,
      tab: true,
      af: true,
    };
  return key in supportedParameters;
}

// Duplicate code END

export function isCoveoSearchParam(
  key: string,
  value: NextJSServerSideSearchParamsValues
) {
  if (value === undefined) {
    return;
  }
  const facetPrefix = /^(f|fExcluded|cf|nf|df|sf|af)-(.+)$/; // TODO: store these regex in a variable to prevent repetition
  const stringSearchParam = /^(q)$/; // TODO: add other search params
  const result = stringSearchParam.exec(key) || facetPrefix.exec(key);
  return result !== null;
}

export function isFacetPair(
  pair: [SearchParameterKey, unknown]
): pair is FacetPair {
  const [key, value] = pair;
  if (!isObject(value)) {
    return false;
  }
  if (!isSpecificFacetKey(key)) {
    return false;
  }

  const isValidValue = (v: unknown) => typeof v === 'string';
  return allEntriesAreValid(value, isValidValue);
}

export function isRangeFacetPair(
  key: SearchParameterKey,
  obj: unknown
): obj is Record<string, RangeValueRequest[]> {
  if (!isObject(obj)) {
    return false;
  }
  if (key !== 'nf' && key !== 'df') {
    return false;
  }

  // TODO: reset array
  const isRangeValue = (v: unknown) =>
    isObject(v) && 'start' in v && 'end' in v;
  return allEntriesAreValid(obj, isRangeValue);
}

// duplicated with slight changes
export function isSpecificFacetKey(
  key: string // This was a slight type change
): key is 'f' | 'af' | 'cf' | 'sf' | 'fExcluded' {
  const keys = ['f', 'af', 'cf', 'sf', 'fExcluded'];
  return keys.includes(key);
}
export function processObjectValue(
  key: string,
  value: string | string[] // TODO: check why string [] is needed
  // ): string | NumericRangeRequest | DateRangeRequest {
): string | string[] {
  if (key === 'nf') {
    throw 'TODO: To implement';
    // return buildNumericRanges(values);
  }

  if (key === 'df') {
    throw 'TODO: To implement';
    // return buildDateRanges(values);
  }

  return value;
}

/**
 * Checks if the provided value is an instance of URLSearchParams or ReadonlyURLSearchParams.
 * @param obj - The value to check.
 * @returns True if the value is an instance of URLSearchParams or ReadonlyURLSearchParams, false otherwise.
 */
export function isUrlInstance(
  obj: unknown
): obj is URLSearchParams | ReadonlyURLSearchParams {
  return (
    obj instanceof URLSearchParams || obj instanceof ReadonlyURLSearchParams
  );
}

/**
 * Checks if two arrays have the same values regardless of their order.
 *
 * @param arr1 - The first array.
 * @param arr2 - The second array.
 * @returns {boolean} - True if the arrays have the same values, false otherwise.
 */
export function doHaveSameValues<T>(arr1: T[], arr2: T[]): boolean {
  return (
    arr1.length === arr2.length && arr1.every((value) => arr2.includes(value))
  );
}
