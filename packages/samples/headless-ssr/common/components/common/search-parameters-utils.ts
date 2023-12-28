import {
  API_DATE_FORMAT,
  buildDateRange,
  buildNumericRange,
  type DateRangeRequest,
  type NumericRangeRequest,
  type SearchParameters,
  validateRelativeDate,
} from '@coveo/headless';
import {
  isSearchApiDate,
  validateAbsoluteDate,
  isRelativeDateFormat,
} from '@coveo/headless/ssr';
import {ReadonlyURLSearchParams} from 'next/navigation';

export type SearchParameterKey = keyof SearchParameters;
export type SearchParamPair<T> = [SearchParameterKey, T]; // TODO: not sure this is required
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

export const rangeDelimiterExclusive = '..';
export const rangeDelimiterInclusive = '...';

const supportedFacetParameters = {
  f: true,
  fExcluded: true,
  cf: true,
  nf: true,
  df: true,
  sf: true,
  af: true,
};

const otherSupportedParameters: Omit<
  Record<keyof SearchParameters, boolean>,
  keyof typeof supportedFacetParameters
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

type FacetKey = keyof typeof supportedFacetParameters;

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
  return key in {...supportedFacetParameters, ...otherSupportedParameters};
}

export function isValidSearchParam(key: string) {
  // TODO: instead do key.split('-') and use isSpecificFacetKey() method. But before understand why some keys are missing from it
  const facetPrefix = /^(f|fExcluded|cf|nf|df|sf|af)-(.+)$/; // TODO: store these regex in a variable to prevent repetition or build it from supportedFacetParameters
  const result = facetPrefix.exec(key) || isSpecificNonFacetKey(key);
  return result !== null;
}

export function isFacetPair(
  pair: [SearchParameterKey, unknown]
): pair is SearchParamPair<FacetValue> {
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
  pair: [SearchParameterKey, unknown]
): pair is SearchParamPair<RangeFacetValue> {
  const [key, value] = pair;
  if (!isObject(value)) {
    return false;
  }
  if (key !== 'nf' && key !== 'df') {
    return false;
  }

  const isRangeValue = (v: unknown) =>
    isObject(v) && 'start' in v && 'end' in v;
  return allEntriesAreValid(value, isRangeValue);
}

export function isSpecificFacetKey(key: any): key is FacetKey {
  return Object.keys(supportedFacetParameters).includes(key);
}

function isSpecificNonFacetKey(
  key: any
): key is Exclude<SearchParameterKey, FacetKey> {
  return Object.keys(otherSupportedParameters).includes(key);
}

// TODO: CHECK IF THIS CAN BE EXPORTED FROM HEADLESS/SRR
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

// TODO: CHECK IF THIS CAN BE EXPORTED FROM HEADLESS/SRR
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

export function buildNumericRanges(ranges: string[]) {
  // TODO: remove export
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

// TODO: CHECK IF THIS CAN BE EXPORTED FROM HEADLESS/SRR
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

export function removeKeysFromUrlSearchParams(
  urlSearchParams: URLSearchParams,
  keys: string[]
) {
  for (const key of keys) {
    urlSearchParams.delete(key);
  }
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
  arr1: T[],
  arr2: T[]
): boolean {
  if (
    arr1.length === arr2.length &&
    arr1.every((value) => arr2.includes(value))
  ) {
    return !arr1.every((value, idx) => arr2.indexOf(value) === idx);
  }
  return false;
}
