import {isString} from '@coveo/bueno';
import {isSearchApiDate} from '../../api/search/date/date-format';
import {isRelativeDateFormat} from '../../api/search/date/relative-date';
import {buildDateRange} from '../../controllers/facets/range-facet/date-facet/headless-date-facet';
import {buildNumericRange} from '../../controllers/facets/range-facet/numeric-facet/headless-numeric-facet';
import {RangeValueRequest} from '../facets/range-facets/generic/interfaces/range-facet';
import {SearchParameters} from './search-parameter-actions';

const delimiter = '&';
const equal = '=';
const rangeDelimiter = '..';

type SearchParameterKey = keyof SearchParameters;
type UnknownObject = {[field: string]: unknown[]};

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

  if (key === 'f' || key === 'cf' || key === 'sf') {
    return isFacetObject(val) ? serializeFacets(key, val) : '';
  }

  if (key === 'nf' || key === 'df') {
    return isRangeFacetObject(val) ? serializeRangeFacets(key, val) : '';
  }

  return `${key}${equal}${encodeURIComponent(
    val as string | number | boolean
  )}`;
}

function isFacetObject(obj: unknown): obj is Record<string, string[]> {
  if (!isObject(obj)) {
    return false;
  }

  const isValidValue = (v: unknown) => typeof v === 'string';
  return allEntriesAreValid(obj, isValidValue);
}

function isRangeFacetObject(
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
        `${key}[${facetId}]${equal}${values
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
        .map(({start, end}) => `${start}${rangeDelimiter}${end}`)
        .join(',');
      return `${key}[${facetId}]${equal}${value}`;
    })
    .join(delimiter);
}

function deserialize(fragment: string): SearchParameters {
  const parts = fragment.split(delimiter);
  const keyValuePairs = parts
    .map((part) => splitOnFirstEqual(part))
    .map(preprocessObjectPairs)
    .filter(isValidPair)
    .map(cast);

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
  const objectKey = /^(f|cf|nf|df|sf)\[(.+)\]$/;
  const result = objectKey.exec(key);

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

function buildNumericRanges(ranges: string[]) {
  return ranges
    .map((str) => str.split(rangeDelimiter).map(parseFloat))
    .filter((range) => range.length === 2 && range.every(Number.isFinite))
    .map(([start, end]) => buildNumericRange({start, end, state: 'selected'}));
}

function buildDateRanges(ranges: string[]) {
  return ranges
    .map((str) => str.split(rangeDelimiter))
    .filter(
      (range) =>
        range.length === 2 &&
        range.every(
          (value) => isSearchApiDate(value) || isRelativeDateFormat(value)
        )
    )
    .map(([start, end]) => buildDateRange({start, end, state: 'selected'}));
}

function isValidPair<K extends SearchParameterKey>(
  pair: string[]
): pair is [K, string] {
  const validKey = isValidKey(pair[0]);
  const lengthOfTwo = pair.length === 2;
  return validKey && lengthOfTwo;
}

function isValidKey(key: string): key is SearchParameterKey {
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
      cf: true,
      nf: true,
      df: true,
      debug: true,
      sf: true,
      tab: true,
    };

  return key in supportedParameters;
}

function cast<K extends SearchParameterKey>(pair: [K, string]): [K, unknown] {
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

  return [key, decodeURIComponent(value)];
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

function keyHasObjectValue(
  key: SearchParameterKey
): key is 'f' | 'cf' | 'nf' | 'df' | 'sf' {
  const keys = ['f', 'cf', 'nf', 'df', 'sf'];
  return keys.includes(key);
}
