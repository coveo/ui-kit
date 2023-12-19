import {type SearchParameters} from '@coveo/headless/ssr';

export type SearchParameterKey = keyof SearchParameters;

export type NextJSServerSideSearchParamsValues = string | string[] | undefined;
export type NextJSServerSideSearchParams = Record<
  string,
  NextJSServerSideSearchParamsValues
>;

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
      fExcluded: true,
      cf: true,
      nf: true,
      df: true,
      debug: true,
      sf: true,
      tab: true,
      af: true,
    };
  return key in supportedParameters;
}

// Duplicate code END

// duplicated with slight changes
export function isSpecificFacetKey(
  key: string // This was a slight type change
): key is 'f' | 'af' | 'cf' | 'sf' | 'fExcluded' {
  const keys = ['f', 'af', 'cf', 'sf', 'fExcluded'];
  return keys.includes(key);
}
export function processObjectValue(
  key: string,
  value: string | string[] // TODO: check why string [] is needed
  // ): string | NumericRangeRequest | DateRangeRequest {
): string | string[] {
  if (key === 'nf') {
    throw 'TODO: To implement';
    // return buildNumericRanges(values);
  }

  if (key === 'df') {
    throw 'TODO: To implement';
    // return buildDateRanges(values);
  }

  return value;
}
