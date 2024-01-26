import {isString} from '@coveo/bueno';
import {
  API_DATE_FORMAT,
  isSearchApiDate,
  validateAbsoluteDate,
} from '../../api/search/date/date-format';
import {
  isRelativeDateFormat,
  validateRelativeDate,
} from '../../api/search/date/relative-date';
import {buildDateRange} from '../../controllers/facets/range-facet/date-facet/headless-date-facet';
import {buildNumericRange} from '../../controllers/facets/range-facet/numeric-facet/headless-numeric-facet';
import {RangeValueRequest} from '../facets/range-facets/generic/interfaces/range-facet';
import {SearchParameters} from './search-parameter-actions';

export const rangeDelimiterExclusive = '..';
export const rangeDelimiterInclusive = '...';
export const facetSearchParamRegex = /^(f|fExcluded|cf|nf|df|sf|af)-(.+)$/;
export type SearchParameterKey = keyof SearchParameters;
type UnknownObject = {[field: string]: unknown[]};

type FacetSearchParameters = keyof Pick<
  SearchParameters,
  'f' | 'fExcluded' | 'cf' | 'sf' | 'af' | 'nf' | 'df'
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
};

const delimiter = '&';
const equal = '=';

export function buildSearchParameterSerializer() {
  return {serialize, deserialize};
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
): key is Extract<FacetKey, 'nf' | 'df'> {
  const supportedRangeFacetParameters: Pick<
    typeof supportedFacetParameters,
    'df' | 'nf'
  > = {
    nf: true,
    df: true,
  };
  const isRangeFacet = key in supportedRangeFacetParameters;
  return keyHasObjectValue(key) && isRangeFacet;
}

export function isValidKey(key: string): key is SearchParameterKey {
  return isValidBasicKey(key) || keyHasObjectValue(key);
}

function serialize(obj: SearchParameters) {
  return Object.entries(obj)
    .map(serializePair)
    .filter((str) => str)
    .join(delimiter);
}

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

function isObject(obj: unknown): obj is object {
  return obj && typeof obj === 'object' ? true : false;
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

function serializeFacets(key: string, facets: Record<string, string[]>) {
  return Object.entries(facets)
    .map(
      ([facetId, values]) =>
        `${key}-${facetId}${equal}${values
          .map((value) => encodeURIComponent(value))
          .join(',')}`
    )
    .join(delimiter);
}

function serializeRangeFacets(
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
    .map(preprocessObjectPairs)
    .filter(isValidPair)
    .map((pair) => cast(pair));

  return keyValuePairs.reduce((acc: SearchParameters, pair) => {
    const [key, val] = pair;

    if (keyHasObjectValue(key)) {
      const mergedValues = {...acc[key], ...(val as object)};
      return {...acc, [key]: mergedValues};
    }

    return {...acc, [key]: val};
  }, {});
}

function splitOnFirstEqual(str: string) {
  const [first, ...rest] = str.split(equal);
  const second = rest.join(equal);

  return [first, second];
}

function preprocessObjectPairs(pair: string[]) {
  const [key, val] = pair;
  const result = facetSearchParamRegex.exec(key);

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
  if (key === 'nf') {
    return buildNumericRanges(values);
  }

  if (key === 'df') {
    return buildDateRanges(values);
  }

  return values;
}

export function buildNumericRanges(ranges: string[]) {
  return ranges
    .map((str) => {
      const {startAsString, endAsString, isEndInclusive} =
        splitRangeValueAsStringByDelimiter(str);

      return {
        start: parseFloat(startAsString),
        end: parseFloat(endAsString),
        endInclusive: isEndInclusive,
      };
    })
    .filter(({start, end}) => Number.isFinite(start) && Number.isFinite(end))
    .map(({start, end, endInclusive}) =>
      buildNumericRange({start, end, state: 'selected', endInclusive})
    );
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
  } catch (error) {
    return false;
  }
}

export function buildDateRanges(ranges: string[]) {
  return ranges
    .map((str) => {
      const {isEndInclusive, startAsString, endAsString} =
        splitRangeValueAsStringByDelimiter(str);

      return {
        start: startAsString,
        end: endAsString,
        endInclusive: isEndInclusive,
      };
    })
    .filter(
      ({start, end}) =>
        isValidDateRangeValue(start) && isValidDateRangeValue(end)
    )
    .map(({start, end, endInclusive}) =>
      buildDateRange({start, end, state: 'selected', endInclusive})
    );
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

function castUnknownObject(value: string) {
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
