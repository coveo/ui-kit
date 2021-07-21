import {
  buildDateRange,
  DateRangeRequest,
} from '../../controllers/facets/range-facet/date-facet/headless-date-facet';
import {
  buildNumericRange,
  NumericRangeRequest,
} from '../../controllers/facets/range-facet/numeric-facet/headless-numeric-facet';
import {isSearchApiDate} from '../../api/date-format';
import {SearchParameters} from './search-parameter-actions';
import {RelativeDate} from '../relative-date-set/relative-date';

const delimiter = '&';
const equal = '=';
const rangeDelimiter = '..';

export function buildSearchParameterSerializer() {
  return {serialize, deserialize};
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

  if (key === 'f' || key === 'cf') {
    return isFacetObject(val) ? serializeFacets(key, val) : '';
  }

  if (key === 'nf') {
    return isRangeFacetObject<NumericRangeRequest>(val)
      ? serializeNumericFacets(key, val)
      : '';
  }

  if (key === 'df') {
    return isRangeFacetObject<DateRangeRequest>(val)
      ? serializeDateFacets(key, val)
      : '';
  }

  return `${key}${equal}${val}`;
}

function isFacetObject(obj: unknown): obj is Record<string, string[]> {
  if (!isObject(obj)) {
    return false;
  }

  const isValidValue = (v: unknown) => typeof v === 'string';
  return allEntriesAreValid(obj, isValidValue);
}

function isRangeFacetObject<R extends NumericRangeRequest | DateRangeRequest>(
  obj: unknown
): obj is Record<string, R[]> {
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
    .map(([facetId, values]) => `${key}[${facetId}]${equal}${values.join(',')}`)
    .join(delimiter);
}

function serializeRangeFacets<R extends NumericRangeRequest | DateRangeRequest>(
  key: string,
  facets: Record<string, R[]>,
  buildRangeValue: (range: R) => string
) {
  return Object.entries(facets)
    .map(([facetId, ranges]) => {
      const value = ranges.map(buildRangeValue).join(',');
      return `${key}[${facetId}]${equal}${value}`;
    })
    .join(delimiter);
}

function serializeNumericFacets(
  key: string,
  facets: Record<string, NumericRangeRequest[]>
) {
  return serializeRangeFacets(
    key,
    facets,
    ({start, end}) => `${start}${rangeDelimiter}${end}`
  );
}

function serializeDateFacetValue(value: string | RelativeDate) {
  if (typeof value === 'string') {
    return value;
  }

  if (value.period === 'now') {
    return value.period;
  }

  return `${value.period}${value.amount}${value.unit}`;
}

function serializeDateFacets(
  key: string,
  facets: Record<string, DateRangeRequest[]>
) {
  return serializeRangeFacets(
    key,
    facets,
    ({start, end}) =>
      `${serializeDateFacetValue(
        start
      )}${rangeDelimiter}${serializeDateFacetValue(end)}`
  );
}

function deserialize(fragment: string): SearchParameters {
  const parts = fragment.split(delimiter);
  const keyValuePairs = parts
    .map((part) => splitOnFirstEqual(part))
    .map(preprocessFacetPairs)
    .filter(isValidPair)
    .map(cast);

  return keyValuePairs.reduce((acc: SearchParameters, pair) => {
    const [key, val] = pair;

    if (key === 'f' || key === 'cf' || key === 'nf' || key === 'df') {
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

function preprocessFacetPairs(pair: string[]) {
  const [key, val] = pair;
  const facetKey = /^(f|cf|nf|df)\[(.+)\]$/;
  const result = facetKey.exec(key);

  if (!result) {
    return pair;
  }

  const paramKey = result[1];
  const facetId = result[2];
  const values = val.split(',');
  const processedValues = processFacetValues(paramKey, values);
  const obj = {[facetId]: processedValues};

  return [paramKey, JSON.stringify(obj)];
}

function processFacetValues(key: string, values: string[]) {
  if (key === 'nf') {
    return buildNumericRanges(values);
  }

  if (key === 'df') {
    return buildDateRanges(values);
  }

  return values;
}

function buildNumericRanges(ranges: string[]) {
  return ranges
    .map((str) => str.split(rangeDelimiter).map(parseFloat))
    .filter((range) => range.length === 2 && range.every(Number.isFinite))
    .map(([start, end]) => buildNumericRange({start, end, state: 'selected'}));
}

function buildDateRanges(ranges: string[]) {
  // TODO: parse relative ranges from string
  return ranges
    .map((str) => str.split(rangeDelimiter))
    .filter((range) => range.length === 2 && range.every(isSearchApiDate))
    .map(([start, end]) =>
      buildDateRange({start, end, useLocalTime: true, state: 'selected'})
    );
}

function isValidPair<K extends keyof SearchParameters>(
  pair: string[]
): pair is [K, string] {
  const validKey = isValidKey(pair[0]);
  const lengthOfTwo = pair.length === 2;
  return validKey && lengthOfTwo;
}

function isValidKey(key: string): key is keyof SearchParameters {
  const supportedParameters: Record<
    keyof Required<SearchParameters>,
    boolean
  > = {
    q: true,
    aq: true,
    cq: true,
    enableQuerySyntax: true,
    firstResult: true,
    numberOfResults: true,
    sortCriteria: true,
    f: true,
    cf: true,
    nf: true,
    df: true,
    debug: true,
  };

  return key in supportedParameters;
}

function cast<K extends keyof SearchParameters>(
  pair: [K, string]
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

  if (key === 'f' || key === 'cf' || key === 'nf' || key === 'df') {
    return [key, JSON.parse(value)];
  }

  return pair;
}
