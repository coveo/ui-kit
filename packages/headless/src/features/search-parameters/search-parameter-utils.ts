import {isNullOrUndefined} from '@coveo/bueno';
import {DateRangeRequest} from './../facets/range-facets/date-facet-set/interfaces/request';
import {NumericRangeRequest} from './../facets/range-facets/numeric-facet-set/interfaces/request';
import {SearchParameters} from './search-parameter-actions';
import {
  SearchParameterKey,
  buildDateRanges,
  buildNumericRanges,
  isFacetObject,
  isRangeFacetObject,
} from './search-parameter-serializer';

// TODO: look at this circular dependency

export type SearchParamPair<T> = [SearchParameterKey, T];
export type FacetValueSearchParam = Record<string, string[]>;
export type RangeFacetValueSearchParam = Record<
  string,
  DateRangeRequest[] | NumericRangeRequest[]
>;

export type ServerSideSearchParamsValues = string | string[] | undefined;
export type ServerSideSearchParams = Record<
  string,
  ServerSideSearchParamsValues
>;

// TODO: move to upper level
type FacetSearchParameters = keyof Pick<
  SearchParameters,
  'f' | 'fExcluded' | 'cf' | 'nf' | 'df' | 'sf' | 'af'
>;

// TODO: move to upper level
type BasicSearchParameters = Exclude<
  keyof SearchParameters,
  FacetSearchParameters
>;

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

export function isValidKey(key: string): key is SearchParameterKey {
  return isValidBasicKey(key) || isValidFacetKey(key);
}

export function isValidBasicKey(
  key: string
): key is Exclude<SearchParameterKey, FacetKey> {
  return Object.keys(supportedBasicParameters).includes(key);
}

export function isValidFacetKey(key: string): key is FacetKey {
  return Object.keys(supportedFacetParameters).includes(key);
}

export function isValidSearchParam(key: string) {
  return facetSearchParamRegex.exec(key) !== null || isValidBasicKey(key);
}

export function isFacetPair(
  pair: [SearchParameterKey, unknown]
): pair is SearchParamPair<FacetValueSearchParam> {
  const [key, value] = pair;
  if (!isValidFacetKey(key)) {
    return false;
  }

  return isFacetObject(value);
}

export function isRangeFacetPair(
  pair: [SearchParameterKey, unknown]
): pair is SearchParamPair<RangeFacetValueSearchParam> {
  const [key, value] = pair;
  if (key !== 'nf' && key !== 'df') {
    return false;
  }

  return isRangeFacetObject(value);
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
  value: ServerSideSearchParamsValues
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

    const range =
      paramKey === 'nf'
        ? buildNumericRanges(toArray(value))
        : paramKey === 'df'
          ? buildDateRanges(toArray(value))
          : toArray(value);

    add(searchParams, range);
  }
}
