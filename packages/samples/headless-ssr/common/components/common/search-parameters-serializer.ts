import {SearchParameters} from '@coveo/headless/ssr';
import type {ReadonlyURLSearchParams} from 'next/navigation';
import {
  doHaveSameValues,
  FacetPair,
  isCoveoSearchParam,
  isFacetPair,
  isSpecificFacetKey,
  isUrlInstance,
  isValidKey,
  NextJSServerSideSearchParams,
  NextJSServerSideSearchParamsValues,
  processObjectValue,
  SearchParameterKey,
} from './search-parameters-utils';

type PreviousCoveoSearchParamsState = Partial<Record<string, string[]>>;
export class CoveoNextJsSearchParametersSerializer {
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
    const previousState = this.resetCoveoSearchParams(urlSearchParams);
    const newState = this.coveoSearchParameters;
    // store the old state (deleted search params) in a variable. This will be used later to compare the sort
    Object.entries(newState).forEach(
      ([key, value]) =>
        isValidKey(key) &&
        this.applyToUrlSearchParam(urlSearchParams, previousState, [key, value])
    );
  }

  // TODO: clean that method
  private resetCoveoSearchParams(
    urlSearchParams: URLSearchParams
  ): PreviousCoveoSearchParamsState {
    const previousCoveoSearchParams: Record<string, string[]> = {};
    // Build previous Coveo search parameter state
    const keysToDelete: string[] = [];
    urlSearchParams.forEach((value, key) => {
      if (isCoveoSearchParam(key, value)) {
        previousCoveoSearchParams[key] = [
          ...(previousCoveoSearchParams[key] || []),
          value,
        ];
        keysToDelete.push(key);
      } // TODO: not sure if mutation here is safe}
    });

    // Need another loop to delete keys since Next.js store can have multiple values for the same key
    for (const key in keysToDelete) {
      urlSearchParams.delete(key);
    }

    return previousCoveoSearchParams;
  }

  private applyToUrlSearchParam(
    urlSearchParams: URLSearchParams,
    previousState: PreviousCoveoSearchParamsState,
    pair: [SearchParameterKey, unknown]
  ) {
    if (!pair[1]) {
      return;
    }

    if (isFacetPair(pair)) {
      return this.applyFacetValuesToSearchParams(
        urlSearchParams,
        previousState,
        pair
      );
    }

    // TODO: uncomment and fix type error
    // if (isRangeFacetPair(pair)) {
    //   return this.applyRangeFacetValuesToSearchParams(urlSearchParams, pair);
    // }

    urlSearchParams.set(pair[0], pair[1].toString());
  }

  private applyFacetValuesToSearchParams(
    urlSearchParams: URLSearchParams,
    previousState: PreviousCoveoSearchParamsState,
    [key, value]: FacetPair
  ) {
    Object.entries(value).forEach(([facetId, facetValues]) => {
      const id = `${key}-${facetId}`;
      const previousFacetValues = previousState[id];

      if (
        previousFacetValues &&
        doHaveSameValues(previousFacetValues, value[facetId])
      ) {
        return;
      }

      urlSearchParams.delete(id);

      facetValues.forEach(
        (v) =>
          !urlSearchParams.getAll(id).includes(v) &&
          urlSearchParams.append(id, v)
      );
    });
  }

  private applyRangeFacetValuesToSearchParams(
    _urlSearchParams: URLSearchParams,
    [_key, _value]: FacetPair
  ) {
    // if (this.containsSameValues(urlSearchParams.getAll(id), value[facetId])) {
    //   return;
    // }
    throw 'TODO: To implement';
  }
}
