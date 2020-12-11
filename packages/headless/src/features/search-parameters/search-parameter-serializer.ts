import {buildNumericRange} from '../../controllers/facets/range-facet/numeric-facet/headless-numeric-facet';
import {NumericRangeRequest} from '../facets/range-facets/numeric-facet-set/interfaces/request';
import {SearchParameters} from './search-parameter-actions';

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
    return isNumericRangeFacetObject(val) ? serializeRangeFacets(key, val) : '';
  }

  return `${key}${equal}${val}`;
}

function isFacetObject(obj: unknown): obj is Record<string, string[]> {
  if (obj && typeof obj === 'object') {
    const invalidEntries = Object.entries(obj).filter(([key, value]) => {
      const validKey = typeof key === 'string';
      const validValue =
        Array.isArray(value) && value.every((v) => typeof v === 'string');
      const isValid = validKey && validValue;
      return !isValid;
    });

    return invalidEntries.length === 0;
  }
  return false;
}

function isNumericRangeFacetObject(
  obj: unknown
): obj is Record<string, NumericRangeRequest[]> {
  return typeof obj === 'object';
}

function serializeFacets(key: string, facets: Record<string, string[]>) {
  return Object.entries(facets)
    .map(([facetId, values]) => `${key}[${facetId}]${equal}${values.join(',')}`)
    .join(delimiter);
}

function serializeRangeFacets(
  key: string,
  facets: Record<string, NumericRangeRequest[]>
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
    .map(preprocessFacetPairs)
    .filter(isValidPair)
    .map(cast);

  return keyValuePairs.reduce((acc: SearchParameters, pair) => {
    const [key, val] = pair;

    if (key === 'f' || key === 'cf' || key === 'nf') {
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
  const facetKey = /^(f|cf|nf)\[(.+)\]$/;
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

  return values;
}

function buildNumericRanges(ranges: string[]) {
  return ranges.map((range) => {
    const [start, end] = range
      .split(rangeDelimiter)
      .map((num) => parseInt(num, 10));
    return buildNumericRange({start, end});
  });
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

  if (key === 'f' || key === 'cf' || key === 'nf') {
    return [key, JSON.parse(value)];
  }

  return pair;
}
