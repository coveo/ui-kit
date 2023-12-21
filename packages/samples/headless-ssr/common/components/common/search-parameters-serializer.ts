import {RangeValueRequest} from '@coveo/headless/dist/definitions/features/facets/range-facets/generic/interfaces/range-facet';
import {SearchParameters} from '@coveo/headless/ssr';
import type {ReadonlyURLSearchParams} from 'next/navigation';
import {
  doHaveSameValues,
  isFacetPair,
  isRangeFacetPair,
  isSpecificFacetKey,
  isUrlInstance,
  isValidKey,
  NextJSServerSideSearchParams,
  NextJSServerSideSearchParamsValues,
  processObjectValue,
  SearchParameterKey,
} from './search-parameters-utils';

export class CoveoNextJsSearchParametersSerializer {
  private static emptySearchParameters: Record<SearchParameterKey, undefined> =
    // TODO: delete if not used
    {
      q: undefined,
      aq: undefined,
      cq: undefined,
      enableQuerySyntax: undefined,
      firstResult: undefined,
      numberOfResults: undefined,
      sortCriteria: undefined,
      f: undefined,
      fExcluded: undefined,
      cf: undefined,
      nf: undefined,
      df: undefined,
      debug: undefined,
      sf: undefined,
      tab: undefined,
      af: undefined,
    };

  private constructor(
    // TODO: should no longer take SearchParams. but instead a record object. If user wants Coveo Search params, create a getter that parses the object
    public readonly coveoSearchParameters: SearchParameters
  ) {}

  public static fromCoveoSearchParameters(
    coveoSearchParameters: SearchParameters
  ) {
    return new CoveoNextJsSearchParametersSerializer(coveoSearchParameters);
  }

  // TODO: rename
  public static fromUrlSearchParameters(
    clientSideUrlSearchParams:
      | URLSearchParams
      | ReadonlyURLSearchParams
      | NextJSServerSideSearchParams
  ) {
    const coveoSearchParameters: SearchParameters = {}; // TODO: not sure about the type
    const parse = (key: string, value: NextJSServerSideSearchParamsValues) =>
      CoveoNextJsSearchParametersSerializer.parseSearchParametersHelper(
        coveoSearchParameters,
        key,
        value
      );

    if (isUrlInstance(clientSideUrlSearchParams)) {
      clientSideUrlSearchParams.forEach((value, key) => parse(key, value));
    } else {
      Object.entries(clientSideUrlSearchParams).forEach(([key, value]) =>
        parse(key, value)
      );
    }

    return new CoveoNextJsSearchParametersSerializer(coveoSearchParameters);
  }

  /**
   * Parses the search parameters and updates the searchParams object based on the provided key and value.
   * TODO: do not return key to delete anymore.
   * TODO: mension that this also mutate the initial object
   *
   * @param searchParams - The search parameters object to be updated.
   * @param key - The key representing the search parameter.
   * @param value - The value of the search parameter.
   */
  private static parseSearchParametersHelper(
    searchParams: SearchParameters,
    key: string,
    value: NextJSServerSideSearchParamsValues
  ): void {
    if (value === undefined) {
      return;
    }
    const facetPrefix = /^(f|fExcluded|cf|nf|df|sf|af)-(.+)$/;
    const result = facetPrefix.exec(key);
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

      if (paramKey in searchParams) {
        const record = {...searchParams[paramKey]};
        record[facetId] = [...record[facetId], ...valueArray];
        searchParams[paramKey] = record;
      } else {
        searchParams[paramKey] = {[facetId]: valueArray};
      }
    } else {
      if (isValidKey(key)) {
        // FIXME: fix type error
        searchParams[key] = value;
      }
    }
  }

  /**
   * Applies the search parameters to the given URL search params.
   * This mutate the url search params!!!
   *
   * @param {URLSearchParams} urlSearchParams
   */
  public applyToUrlSearchParams(urlSearchParams: URLSearchParams) {
    this.resetCoveoSearchParams(urlSearchParams); // TODO: reseting here prevents from doing an array comparaison later on
    // store the old state (deleted search params) in a variable. This will be used later to compare the sort
    Object.entries(this.coveoSearchParameters).forEach(
      ([key, value]) =>
        isValidKey(key) &&
        this.applyToUrlSearchParam(urlSearchParams, key, value)
    );
  }

  // TODO: rename
  private static FOOOO(
    urlSearchParams: Record<string, unknown>, // TODO: find a stricter type
    key: string,
    value: NextJSServerSideSearchParamsValues
  ) {
    if (value === undefined) {
      return;
    }
    const facetPrefix = /^(f|fExcluded|cf|nf|df|sf|af)-(.+)$/; // TODO: store these regex in a variable to prevent repetition
    const stringSearchParam = /^(q)$/; // TODO: add other search params
    const result = stringSearchParam.exec(key) || facetPrefix.exec(key);
    return result !== null;
  }

  private resetCoveoSearchParams(urlSearchParams: URLSearchParams) {
    const nonCoveoSearchParam = {};
    // Build previous Coveo search parameter state
    urlSearchParams.forEach((value, key) => {
      const isCoveoSearchParam = CoveoNextJsSearchParametersSerializer.FOOOO(
        nonCoveoSearchParam,
        key,
        value
      );

      isCoveoSearchParam && urlSearchParams.delete(key); // TODO: not sure if mutation here is safe
    });
    // clear all search params from urlSearchParam object

    // get all non Cveo search params
    // wipe all the search params
    // put back non-coveo search params

    // Remove from Url all Coveo search parameters that are not in new state
    // Go trough all previous state and remove all keys

    // Object.entries(previousState).forEach(([key, value]) => {
    //   // if [key, value] not in newState
    //   // then urlSearchParams.delete(key)
    // });
  }

  private applyToUrlSearchParam(
    urlSearchParams: URLSearchParams,
    key: SearchParameterKey,
    value: SearchParameters[typeof key]
  ) {
    if (!value) {
      return;
    }

    if (isFacetPair(key, value)) {
      return this.applyFacetValuesToSearchParams(urlSearchParams, key, value);
    }

    if (isRangeFacetPair(key, value)) {
      return this.applyRangeFacetValuesToSearchParams(
        urlSearchParams,
        value,
        key
      );
    }

    urlSearchParams.set(key, value.toString());
  }

  private applyFacetValuesToSearchParams(
    urlSearchParams: URLSearchParams,
    key: string,
    value: Record<string, string[]>
  ) {
    Object.entries(value).forEach(([facetId, facetValues]) => {
      const id = `${key}-${facetId}`;
      const searchParamValues = urlSearchParams.getAll(id);

      console.log('*********************');
      console.log(id);
      console.log(urlSearchParams.toString());

      if (doHaveSameValues(searchParamValues, value[facetId])) {
        return;
      }
      console.log('*********************');

      urlSearchParams.delete(id);

      facetValues.forEach(
        (v) => !searchParamValues.includes(v) && urlSearchParams.append(id, v)
      );
    });
  }

  private applyRangeFacetValuesToSearchParams(
    _urlSearchParams: URLSearchParams,
    _value: Record<string, RangeValueRequest[]>,
    _key: string
  ) {
    // if (this.containsSameValues(urlSearchParams.getAll(id), value[facetId])) {
    //   return;
    // }
    throw 'TODO: To implement';
  }
}
