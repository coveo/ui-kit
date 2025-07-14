import {isNullOrUndefined} from '@coveo/bueno';
import {isEmptyString} from '../../utils/utils.js';
import type {DateRangeRequest} from '../facets/range-facets/date-facet-set/interfaces/request.js';
import type {NumericRangeRequest} from '../facets/range-facets/numeric-facet-set/interfaces/request.js';
import {
  buildDateRanges,
  buildNumericRanges,
  cast,
  facetSearchParamRegex,
  isFacetObject,
  isRangeFacetObject,
  isValidBasicKey,
  keyHasObjectValue,
  type SearchParameterKey,
} from './search-parameter-serializer.js';

export type SearchParamValue = string | string[] | undefined;
export type SearchParamPair<T> = [SearchParameterKey, T];
export type FacetValueSearchParam = Record<string, string[]>;
export type RangeFacetValueSearchParam = Record<
  string,
  DateRangeRequest[] | NumericRangeRequest[]
>;

export function toArray<T>(value: T | T[]): T[] {
  return Array.isArray(value) ? value : [value];
}

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
    } else {
      searchParams[paramKey] = {[facetId]: valueArray};
    }
  };
}
export function isValidSearchParam(key: string) {
  return facetSearchParamRegex.exec(key) !== null || isValidBasicKey(key);
}

export function isFacetPair(
  pair: [SearchParameterKey, unknown]
): pair is SearchParamPair<FacetValueSearchParam> {
  const [key, value] = pair;
  const isValidKey = keyHasObjectValue(key);
  const isValidValue = isFacetObject(value);
  return isValidKey && isValidValue;
}

export function isRangeFacetPair(
  pair: [SearchParameterKey, unknown]
): pair is SearchParamPair<RangeFacetValueSearchParam> {
  const [key, value] = pair;
  const isValidKey = key === 'nf' || key === 'df';
  const isValidValue = isRangeFacetObject(value);
  return isValidKey && isValidValue;
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
  value: SearchParamValue
): void {
  if (isNullOrUndefined(value)) {
    return;
  }
  if (
    isValidBasicKey(key) &&
    typeof value === 'string' &&
    !isEmptyString(value)
  ) {
    const [k, v] = cast([key, value], false);
    searchParams[k] = v;
    return;
  }

  const result = facetSearchParamRegex.exec(key);
  if (result) {
    const paramKey = result[1];
    const facetId = result[2];
    if (!keyHasObjectValue(paramKey)) {
      return;
    }
    const add = addFacetValuesToSearchParams(facetId, paramKey);

    const range =
      paramKey === 'nf'
        ? buildNumericRanges(toArray(value), 'selected')
        : paramKey === 'df'
          ? buildDateRanges(toArray(value), 'selected')
          : toArray(value);

    add(searchParams, range);
  }
}
