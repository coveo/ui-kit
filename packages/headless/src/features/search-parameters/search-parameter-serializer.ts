import {
  buildRelativeDateRange,
  DateRangeRequest,
} from '../../controllers/facets/range-facet/date-facet/headless-date-facet';
import {buildNumericRange} from '../../controllers/facets/range-facet/numeric-facet/headless-numeric-facet';
import {
  RelativeDate,
  RelativeDatePeriod,
  relativeDatePeriods,
  RelativeDateUnit,
  relativeDateUnits,
} from '../facets/range-facets/date-facet-set/relative-date';
import {RangeValueRequest} from '../facets/range-facets/generic/interfaces/range-facet';
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
    return isRangeFacetObject(val) ? serializeRangeFacets(key, val) : '';
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

function isRangeFacetObject<R extends RangeValueRequest = RangeValueRequest>(
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

function serializeRangeFacets<R extends RangeValueRequest = RangeValueRequest>(
  key: string,
  facets: Record<string, R[]>,
  buildRangeValue = ({start, end}: R) => `${start}${rangeDelimiter}${end}`
) {
  return Object.entries(facets)
    .map(([facetId, ranges]) => {
      const value = ranges.map(buildRangeValue).join(',');
      return `${key}[${facetId}]${equal}${value}`;
    })
    .join(delimiter);
}

function serializeDateFacets(
  key: string,
  facets: Record<string, DateRangeRequest[]>
) {
  return serializeRangeFacets<DateRangeRequest>(
    key,
    facets,
    ({start, end, relativeDate}) =>
      relativeDate
        ? `${relativeDate.period}${relativeDate.amount}${relativeDate.unit}`
        : `${start}${rangeDelimiter}${end}`
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

const relativeDateFormatRegexp = new RegExp(
  // Matches `past1month`, `future5year`, etc.
  `^(${relativeDatePeriods.join('|')})(\\d+)(${relativeDateUnits.join('|')})$`,
  'i'
);

function isRelativeDateFormat(date: string) {
  return relativeDateFormatRegexp.test(date);
}

function parseRelativeDateFormat(date: string) {
  const matches = date.match(relativeDateFormatRegexp)!;
  return {
    period: matches[1] as RelativeDatePeriod,
    amount: parseInt(matches[2]),
    unit: matches[3] as RelativeDateUnit,
  };
}

function buildDateRanges(ranges: string[]) {
  const relativeRanges = ranges.filter(isRelativeDateFormat).map((range) =>
    buildRelativeDateRange({
      relativeDate: parseRelativeDateFormat(range),
      state: 'selected',
    })
  );

  const absoluteRanges = ranges
    .filter((range) => !isRelativeDateFormat(range))
    .map((str) => str.split(rangeDelimiter).map(parseFloat))
    .filter((range) => range.length === 2 && range.every(Number.isFinite))
    .map(([start, end]) => buildNumericRange({start, end, state: 'selected'}));

  return [...relativeRanges, ...absoluteRanges];
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
