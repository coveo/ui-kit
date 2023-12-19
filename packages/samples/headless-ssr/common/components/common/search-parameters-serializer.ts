import {RangeValueRequest} from '@coveo/headless/dist/definitions/features/facets/range-facets/generic/interfaces/range-facet';
import {type SearchParameters} from '@coveo/headless/ssr';
import {ReadonlyURLSearchParams} from 'next/navigation';

type SearchParameterKey = keyof SearchParameters;

type NextJSServerSideSearchParamsValues = string | string[] | undefined;
export type NextJSServerSideSearchParams = Record<
  string,
  NextJSServerSideSearchParamsValues
>;

// Duplicate code START
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
function isSpecificFacetKey(
  key: string // This was a slight type change
): key is 'f' | 'af' | 'cf' | 'sf' | 'fExcluded' {
  const keys = ['f', 'af', 'cf', 'sf', 'fExcluded'];
  return keys.includes(key);
}
function processObjectValue(
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

// TODO: have a function CoveoSearchParamsToUrlSearchParams and vice versa
export class CoveoNextJsSearchParametersSerializer {
  public static fromServerSideUrlSearchParams(
    serverSideUrlSearchParams: NextJSServerSideSearchParams
  ): CoveoNextJsSearchParametersSerializer {
    // TODO: revisit design, not useful. need to call 2 methods here

    const parsedSearchParameters: SearchParameters = {};
    Object.entries(serverSideUrlSearchParams).forEach(([key, value]) => {
      console.log(value);
      this.parseSearchParametersHelper(parsedSearchParameters, key, value);
    });

    return new CoveoNextJsSearchParametersSerializer(parsedSearchParameters);
  }

  public static fromCoveoSearchParameters(
    coveoSearchParameters: SearchParameters
  ) {
    return new CoveoNextJsSearchParametersSerializer(coveoSearchParameters);
  }

  private static parseSearchParametersHelper(
    res: SearchParameters,
    key: string,
    value: NextJSServerSideSearchParamsValues
  ): void {
    if (value === undefined) {
      return;
    }
    const objectKey = /^(f|fExcluded|cf|nf|df|sf|af)-(.+)$/;
    const result = objectKey.exec(key);
    if (result) {
      const paramKey = result[1];
      const facetId = result[2];
      if (!isSpecificFacetKey(paramKey)) {
        // TODO: merge with regex above
        // THIS does not handle range facets
        return;
      }
      const processedValue = processObjectValue(paramKey, value);
      const valueArray = Array.isArray(processedValue)
        ? processedValue
        : [processedValue];

      if (paramKey in res) {
        const record = {...res[paramKey]};
        record[facetId] = [...(record[facetId] || []), ...valueArray];
        res[paramKey] = record;
      } else {
        res[paramKey] = {[facetId]: valueArray};
      }
    }
  }

  // TODO: find a way to merge both parseSearchParameters2 methods
  public static parseSearchParameters2(
    clientSideUrlSearchParams: URLSearchParams | ReadonlyURLSearchParams
  ): SearchParameters {
    const res: SearchParameters = {}; // TODO: not sure about the type
    clientSideUrlSearchParams.forEach((value, key) => {
      this.parseSearchParametersHelper(res, key, value);
    });

    return res;
  }

  private constructor(
    public readonly coveoSearchParameters: SearchParameters
  ) {}

  public applyToUrlSearchParams(urlSearchParams: URLSearchParams) {
    // TODO: WHY
    // if (!Object.keys(this.coveoSearchParameters).length) {
    //   urlSearchParams.delete(key);
    //   return;
    // }
    Object.entries(this.coveoSearchParameters).forEach(([key, value]) => {
      if (!isValidKey(key)) {
        return;
      }
      this.applyToUrlSearchParam(urlSearchParams, key, value);
    });
  }

  private applyToUrlSearchParam(
    urlSearchParams: URLSearchParams,
    key: SearchParameterKey,
    value: SearchParameters[typeof key]
  ) {
    // TODO: handle facet deselection => clear all facet values and start again to support deselection
    if (!value) {
      return;
    }

    if (this.isFacetPair(key, value)) {
      return this.applyFacetValuesToSearchParams(value, key, urlSearchParams);
    }

    if (this.isRangeFacetPair(key, value)) {
      return this.applyRangeFacetValuesToSearchParams(
        value,
        key,
        urlSearchParams
      );
    }

    urlSearchParams.set(key, value.toString());
  }

  private isRangeFacetPair(
    key: SearchParameterKey,
    obj: unknown
  ): obj is Record<string, RangeValueRequest[]> {
    if (!isObject(obj)) {
      return false;
    }
    if (key !== 'nf' && key !== 'df') {
      return false;
    }

    // TODO: reset array
    const isRangeValue = (v: unknown) =>
      isObject(v) && 'start' in v && 'end' in v;
    return allEntriesAreValid(obj, isRangeValue);
  }

  private isFacetPair(
    key: SearchParameterKey,
    obj: unknown
  ): obj is Record<string, string[]> {
    if (!isObject(obj)) {
      return false;
    }
    if (!isSpecificFacetKey(key)) {
      return false;
    }

    const isValidValue = (v: unknown) => typeof v === 'string';
    return allEntriesAreValid(obj, isValidValue);
  }

  private applyFacetValuesToSearchParams(
    value: Record<string, string[]>,
    key: string,
    urlSearchParams: URLSearchParams
  ) {
    Object.entries(value).forEach(([facetId, facetValues]) => {
      const id = `${key}-${facetId}`;
      urlSearchParams.delete(id);

      facetValues.forEach((v) => {
        const alreadyInSearchParams = urlSearchParams.getAll(id).includes(v);
        !alreadyInSearchParams && urlSearchParams.append(id, v);
      });

      // TODO: handle cases where search params change order
      // http://localhost:3000/react?f-author-1=Jean-Fran%C3%A7ois+L%27Heureux&f-author-1=gminero
      // http://localhost:3000/react?f-author-1=gminero&f-author-1=Jean-Fran%C3%A7ois+L%27Heureux
    });
  }

  private applyRangeFacetValuesToSearchParams(
    _value: Record<string, RangeValueRequest[]>,
    _key: string,
    _urlSearchParams: URLSearchParams
  ) {
    throw 'TODO: To implement';
  }
}
