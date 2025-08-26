import {isString} from '@coveo/bueno';
import {
  API_DATE_FORMAT,
  isSearchApiDate,
  validateAbsoluteDate,
} from '../../api/search/date/date-format.js';
import {
  isRelativeDateFormat,
  validateRelativeDate,
} from '../../api/search/date/relative-date.js';
import {
  buildDateRange,
  type DateRangeRequest,
} from '../../controllers/facets/range-facet/date-facet/headless-date-facet.js';
import {buildNumericRange} from '../../controllers/facets/range-facet/numeric-facet/headless-numeric-facet.js';
import type {FacetValueState} from '../../ssr.index.js';
import type {RangeValueRequest} from '../facets/range-facets/generic/interfaces/range-facet.js';
import type {SearchParameters} from './search-parameter-actions.js';

export const rangeDelimiterExclusive = '..';
export const rangeDelimiterInclusive = '...';
export const facetSearchParamRegex = /^(f|fExcluded|cf|nf|df|sf|af|mnf)-(.+)$/;
export type SearchParameterKey = keyof SearchParameters;
type UnknownObject = {[field: string]: unknown[]};

type FacetSearchParameters = keyof Pick<
  SearchParameters,
  'f' | 'fExcluded' | 'cf' | 'sf' | 'af' | 'nf' | 'df' | 'mnf'
>;

type FacetKey = keyof typeof supportedFacetParameters;

const supportedFacetParameters: Record<FacetSearchParameters, boolean> = {
  f: true,
  fExcluded: true,
  cf: true,
  sf: true,
  af: true,
  nf: true,
  df: true,
  mnf: true,
};

export const delimiter = '&';
const equal = '=';

export function buildSearchParameterSerializer() {
  return {serialize: serialize(serializePair), deserialize: deserialize};
}

export function keyHasObjectValue(key: string): key is FacetKey {
  return key in supportedFacetParameters;
}

export function isValidBasicKey(
  key: string
): key is Exclude<SearchParameterKey, FacetKey> {
  const supportedBasicParameters: Record<
    Exclude<keyof SearchParameters, FacetSearchParameters>,
    boolean
  > = {
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
  return key in supportedBasicParameters;
}

export function isRangeFacetKey(
  key: string
): key is Extract<FacetKey, 'nf' | 'df' | 'mnf'> {
  const supportedRangeFacetParameters: Pick<
    typeof supportedFacetParameters,
    'df' | 'nf' | 'mnf'
  > = {
    nf: true,
    df: true,
    mnf: true,
  };
  const isRangeFacet = key in supportedRangeFacetParameters;
  return keyHasObjectValue(key) && isRangeFacet;
}

export function isValidKey(key: string): key is SearchParameterKey {
  return isValidBasicKey(key) || keyHasObjectValue(key);
}

export const serialize =
  <T extends {}>(pairSerializer: (pair: [string, unknown]) => string) =>
  (obj: T) => {
    return Object.entries(obj)
      .map(pairSerializer)
      .filter((str) => str)
      .join(delimiter);
  };

function serializePair(pair: [string, unknown]) {
  const [key, val] = pair;

  if (!isValidKey(key)) {
    return '';
  }

  if (keyHasObjectValue(key) && !isRangeFacetKey(key)) {
    return isFacetObject(val) ? serializeFacets(key, val) : '';
  }

  if (key === 'nf' || key === 'df') {
    return isRangeFacetObject(val) ? serializeRangeFacets(key, val) : '';
  }

  return serializeSpecialCharacters(key, val);
}

export function serializeSpecialCharacters(key: string, val: unknown) {
  return `${key}${equal}${encodeURIComponent(
    val as string | number | boolean
  )}`;
}

export function isFacetObject(obj: unknown): obj is Record<string, string[]> {
  if (!isObject(obj)) {
    return false;
  }

  const isValidValue = (v: unknown) => typeof v === 'string';
  return allEntriesAreValid(obj, isValidValue);
}

export function isRangeFacetObject(
  obj: unknown
): obj is Record<string, RangeValueRequest[]> {
  if (!isObject(obj)) {
    return false;
  }

  const isRangeValue = (v: unknown) =>
    isObject(v) && 'start' in v && 'end' in v;
  return allEntriesAreValid(obj, isRangeValue);
}

export function isObject(obj: unknown): obj is object {
  return !!(obj && typeof obj === 'object');
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

export function serializeFacets(key: string, facets: Record<string, string[]>) {
  return Object.entries(facets)
    .map(
      ([facetId, values]) =>
        `${key}-${facetId}${equal}${values
          .map((value) => encodeURIComponent(value))
          .join(',')}`
    )
    .join(delimiter);
}

export function serializeRangeFacets(
  key: string,
  facets: Record<string, RangeValueRequest[]>
) {
  return Object.entries(facets)
    .map(([facetId, ranges]) => {
      const value = ranges
        .map(
          ({start, end, endInclusive}) =>
            `${start}${
              endInclusive ? rangeDelimiterInclusive : rangeDelimiterExclusive
            }${end}`
        )
        .join(',');
      return `${key}-${facetId}${equal}${value}`;
    })
    .join(delimiter);
}

function deserialize(fragment: string): SearchParameters {
  const parts = fragment.split(delimiter);
  const keyValuePairs = parts
    .map((part) => splitOnFirstEqual(part))
    .map((parts) => preprocessObjectPairs(parts))
    .filter(isValidPair)
    .map((pair) => cast(pair));

  return keyValuePairs.reduce((acc: SearchParameters, pair) => {
    const [key, val] = pair;

    if (keyHasObjectValue(key)) {
      const mergedValues = {...acc[key], ...(val as object)};
      // biome-ignore lint/performance/noAccumulatingSpread: <>
      return {...acc, [key]: mergedValues};
    }

    // biome-ignore lint/performance/noAccumulatingSpread: <>
    return {...acc, [key]: val};
  }, {});
}

export function splitOnFirstEqual(str: string) {
  const [first, ...rest] = str.split(equal);
  const second = rest.join(equal);

  return [first, second];
}

export function preprocessObjectPairs(
  pair: string[],
  regex = facetSearchParamRegex
) {
  const [key, val] = pair;
  const result = regex.exec(key);

  if (!result) {
    return pair;
  }

  const paramKey = result[1];
  const id = result[2];
  const values = val.split(',');
  const processedValues = processObjectValues(paramKey, values);
  const obj = {[id]: processedValues};

  return [paramKey, JSON.stringify(obj)];
}

function processObjectValues(key: string, values: string[]) {
  if (key === 'nf' || key === 'mnf') {
    return buildNumericRanges(values, 'selected');
  }

  if (key === 'df') {
    return buildDateRanges(values, 'selected');
  }

  return values;
}

export function buildNumericRanges(ranges: string[], state: FacetValueState) {
  const numericRanges = [];

  for (const range of ranges) {
    const {startAsString, endAsString, isEndInclusive} =
      splitRangeValueAsStringByDelimiter(range);

    const start = parseFloat(startAsString);
    const end = parseFloat(endAsString);

    if (!Number.isFinite(start) || !Number.isFinite(end)) {
      continue;
    }

    numericRanges.push(
      buildNumericRange({start, end, state, endInclusive: isEndInclusive})
    );
  }

  return numericRanges;
}

function isValidDateRangeValue(date: string) {
  try {
    if (isSearchApiDate(date)) {
      validateAbsoluteDate(date, API_DATE_FORMAT);
      return true;
    }
    if (isRelativeDateFormat(date)) {
      validateRelativeDate(date);
      return true;
    }

    return false;
  } catch (_) {
    return false;
  }
}

export function buildDateRanges(ranges: string[], state: FacetValueState) {
  const dateRanges: DateRangeRequest[] = [];

  for (const range of ranges) {
    const {isEndInclusive, startAsString, endAsString} =
      splitRangeValueAsStringByDelimiter(range);
    if (
      !isValidDateRangeValue(startAsString) ||
      !isValidDateRangeValue(endAsString)
    ) {
      continue;
    }

    dateRanges.push(
      buildDateRange({
        start: startAsString,
        end: endAsString,
        state,
        endInclusive: isEndInclusive,
      })
    );
  }

  return dateRanges;
}

function isValidPair<K extends SearchParameterKey>(
  pair: string[]
): pair is [K, string] {
  const validKey = isValidKey(pair[0]);
  const lengthOfTwo = pair.length === 2;
  return validKey && lengthOfTwo;
}

export function cast<K extends SearchParameterKey>(
  pair: [K, string],
  decode = true
): [K, unknown] {
  const [key, value] = pair;

  if (key === 'enableQuerySyntax') {
    return [key, value === 'true'];
  }

  if (key === 'debug') {
    return [key, value === 'true'];
  }

  if (key === 'firstResult') {
    return [key, parseInt(value)];
  }

  if (key === 'numberOfResults') {
    return [key, parseInt(value)];
  }

  if (keyHasObjectValue(key)) {
    return [key, castUnknownObject(value)];
  }

  return [key, decode ? decodeURIComponent(value) : value];
}

export function castUnknownObject(value: string) {
  const jsonParsed: UnknownObject = JSON.parse(value);
  const ret: UnknownObject = {};
  Object.entries(jsonParsed).forEach((entry) => {
    const [id, values] = entry;
    ret[id] = values.map((v) => (isString(v) ? decodeURIComponent(v) : v));
  });

  return ret;
}

function splitRangeValueAsStringByDelimiter(str: string) {
  const isEndInclusive = str.indexOf(rangeDelimiterInclusive) !== -1;
  const [startAsString, endAsString] = str.split(
    isEndInclusive ? rangeDelimiterInclusive : rangeDelimiterExclusive
  );
  return {
    isEndInclusive,
    startAsString,
    endAsString,
  };
}
