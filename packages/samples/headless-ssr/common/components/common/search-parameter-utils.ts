import {isNullOrUndefined, isRecord} from '@coveo/bueno';
import {
  type DateRangeRequest,
  type NumericRangeRequest,
  type SearchParameters,
} from '@coveo/headless';
import {buildSearchParameterRanges} from '@coveo/headless-react/ssr';
import {ReadonlyURLSearchParams} from 'next/navigation';

export type SearchParameterKey = keyof SearchParameters;
export type SearchParamPair<T> = [SearchParameterKey, T];
export type FacetValue = Record<string, string[]>;
export type RangeFacetValue = Record<
  string,
  DateRangeRequest[] | NumericRangeRequest[]
>;

export type NextJSServerSideSearchParamsValues = string | string[] | undefined;
export type NextJSServerSideSearchParams = Record<
  string,
  NextJSServerSideSearchParamsValues
>;

type FacetSearchParameters = keyof Pick<
  SearchParameters,
  'f' | 'fExcluded' | 'cf' | 'nf' | 'df' | 'sf' | 'af'
>;

type BasicSearchParameters = Exclude<
  keyof SearchParameters,
  FacetSearchParameters
>;

export const rangeDelimiterExclusive = '..';
export const rangeDelimiterInclusive = '...';
export const facetSearchParamRegex = /^(f|fExcluded|cf|nf|df|sf|af)-(.+)$/;

const supportedFacetParameters: Record<FacetSearchParameters, boolean> = {
  f: true,
  fExcluded: true,
  cf: true,
  nf: true,
  df: true,
  sf: true,
  af: true,
};

const supportedBasicParameters: Record<BasicSearchParameters, boolean> = {
  q: true,
  aq: true,
  cq: true,
  enableQuerySyntax: true,
  firstResult: true,
  numberOfResults: true,
  sortCriteria: true,
  debug: true,
  tab: true,
};

type FacetKey = keyof typeof supportedFacetParameters;

export function toArray<T>(value: T | T[]): T[] {
  return Array.isArray(value) ? value : [value];
}

// TODO: add unit tests for the exported function once bundled in SSR package

export function addFacetValuesToSearchParams(
  facetId: string,
  paramKey: SearchParameterKey
) {
  return (searchParams: Record<string, unknown>, valueArray: unknown[]) => {
    if (paramKey in searchParams) {
      const record = (searchParams[paramKey] ?? {}) as Record<
        string,
        unknown[]
      >;
      record[facetId] = [...(record[facetId] ?? []), ...valueArray];
      searchParams[paramKey] = record;
      return record;
    } else {
      searchParams[paramKey] = {[facetId]: valueArray};
    }
  };
}

export function isValidKey(key: string): key is SearchParameterKey {
  return isValidBasicKey(key) || isValidFacetKey(key);
}

export function isValidBasicKey(
  key: any
): key is Exclude<SearchParameterKey, FacetKey> {
  return Object.keys(supportedBasicParameters).includes(key);
}

export function isValidFacetKey(key: any): key is FacetKey {
  return Object.keys(supportedFacetParameters).includes(key);
}

export function isValidSearchParam(key: string) {
  return facetSearchParamRegex.exec(key) !== null || isValidBasicKey(key);
}

export function isFacetPair(
  pair: [SearchParameterKey, unknown]
): pair is SearchParamPair<FacetValue> {
  const [key, value] = pair;
  if (!isRecord(value)) {
    return false;
  }
  if (!isValidFacetKey(key)) {
    return false;
  }

  const isValidValue = (v: unknown) => typeof v === 'string';
  return allEntriesAreValid(value, isValidValue);
}

export function isRangeFacetPair(
  pair: [SearchParameterKey, unknown]
): pair is SearchParamPair<RangeFacetValue> {
  const [key, value] = pair;
  if (!isRecord(value)) {
    return false;
  }
  if (key !== 'nf' && key !== 'df') {
    return false;
  }

  const isRangeValue = (v: unknown) =>
    isRecord(v) && 'start' in v && 'end' in v;
  return allEntriesAreValid(value, isRangeValue);
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
 * Checks if two arrays have the same elements, in different order.
 *
 * @param arr1 The first array to compare.
 * @param arr2 The second array to compare.
 * @returns `true` if the arrays have the same elements in different order, `false` otherwise.
 * @template T The type of elements in the arrays.
 */
export function areTheSameArraysSortedDifferently<T>(
  // TODO: KIT-2952 use compare-utils.ts -> arrayEqualAnyOrder
  arr1: T[],
  arr2: T[]
): boolean {
  if (arr1.length === arr2.length) {
    if (arr1.length === 1) {
      return arr1[0] === arr2[0];
    }
    if (arr1.every((value) => arr2.includes(value))) {
      return !arr1.every((value, idx) => arr2.indexOf(value) === idx);
    }
  }
  return false;
}

/**
 * Extends the search parameters with the given key-value pair. If the key-value pair is not valid or if the value is undefined, the search parameters are not modified.
 * @param searchParams - The search parameters object to extend.
 * @param key - The key of the search parameter.
 * @param value - The value of the search parameter.
 */
export function extendSearchParameters(
  searchParams: Record<string, unknown>,
  key: string,
  value: NextJSServerSideSearchParamsValues
): void {
  if (isNullOrUndefined(value)) {
    return;
  }
  if (isValidBasicKey(key)) {
    searchParams[key] = value;
    return;
  }

  const result = facetSearchParamRegex.exec(key);
  if (result) {
    const paramKey = result[1];
    const facetId = result[2];
    if (!isValidFacetKey(paramKey)) {
      return;
    }
    const add = addFacetValuesToSearchParams(facetId, paramKey);

    const {buildDateRanges, buildNumericRanges} = buildSearchParameterRanges();

    const range =
      paramKey === 'nf'
        ? buildNumericRanges(toArray(value))
        : paramKey === 'df'
          ? buildDateRanges(toArray(value))
          : toArray(value);

    add(searchParams, range);
  }
}

function allEntriesAreValid(
  obj: object,
  isValidValue: (v: unknown) => boolean
) {
  const invalidEntries = Object.entries(obj).filter((entry) => {
    const values = entry[1];
    return !Array.isArray(values) || !values.every(isValidValue);
  });

  return invalidEntries.length === 0;
}
