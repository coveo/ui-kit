import {
  buildSearchParameterRanges,
  SearchParameters,
} from '@coveo/headless/ssr';
import type {ReadonlyURLSearchParams} from 'next/navigation';
import {
  SearchParamPair,
  isValidSearchParam,
  isFacetPair,
  isSpecificFacetKey,
  isUrlInstance,
  isValidKey,
  NextJSServerSideSearchParams,
  NextJSServerSideSearchParamsValues,
  SearchParameterKey,
  areTheSameArraysSortedDifferently,
  isRangeFacetPair,
  rangeDelimiterInclusive,
  rangeDelimiterExclusive,
  FacetValue,
  RangeFacetValue,
  isSpecificNonFacetKey,
} from './search-parameters-utils';

export class CoveoNextJsSearchParametersSerializer {
  private constructor(
    public readonly coveoSearchParameters: SearchParameters
  ) {}

  /**
   * Converts a {@link SearchParameters} object to a CoveoNextJsSearchParametersSerializer object.
   * This class can help you serialize and deserialize Coveo search parameters to and from URL search parameters.
   *
   * @param coveoSearchParameters - The {@link SearchParameters} object to convert.
   * @returns A new instance of CoveoNextJsSearchParametersSerializer.
   */
  public static fromCoveoSearchParameters(
    coveoSearchParameters: SearchParameters
  ) {
    return new CoveoNextJsSearchParametersSerializer(coveoSearchParameters);
  }

  /**
   * Converts URL search parameters into a CoveoNextJsSearchParametersSerializer object.
   * This class can help you serialize and deserialize Coveo search parameters to and from URL search parameters.
   *
   * @param clientSideUrlSearchParams - The URL search parameters to convert.
   * @returns A CoveoNextJsSearchParametersSerializer instance with the converted search parameters.
   */
  public static fromUrlSearchParameters(
    clientSideUrlSearchParams:
      | URLSearchParams
      | ReadonlyURLSearchParams
      | NextJSServerSideSearchParams
  ) {
    const coveoSearchParameters: Record<string, unknown> = {};
    const add = (key: string, value: NextJSServerSideSearchParamsValues) =>
      CoveoNextJsSearchParametersSerializer.extendSearchParameters(
        coveoSearchParameters,
        key,
        value
      );

    if (isUrlInstance(clientSideUrlSearchParams)) {
      clientSideUrlSearchParams.forEach((value, key) => add(key, value));
    } else {
      Object.entries(clientSideUrlSearchParams).forEach(([key, value]) =>
        add(key, value)
      );
    }

    return new CoveoNextJsSearchParametersSerializer(coveoSearchParameters);
  }

  /**
   * Applies the Coveo search parameters to the given URLSearchParams object.
   * Warning: This method mutates the given URLSearchParams object.
   *
   * @param urlSearchParams - The URLSearchParams object to apply the new search parameters to.
   */
  public applyToUrlSearchParams(urlSearchParams: URLSearchParams) {
    const previousState = this.wipeCoveoSearchParamFromUrl(urlSearchParams);
    const newState = this.coveoSearchParameters;
    Object.entries(newState).forEach(
      ([key, value]) =>
        isValidKey(key) &&
        this.applyToUrlSearchParam(urlSearchParams, previousState, [key, value])
    );
  }

  /**
   * Augment the coveo search parameters object based on the provided key and value.
   *
   * @param searchParams - The search parameters object to be updated.
   * @param key - The key of the search parameter.
   * @param value - The value of the search parameter.
   */
  private static extendSearchParameters(
    searchParams: SearchParameters,
    key: string,
    value: NextJSServerSideSearchParamsValues
  ): void {
    if (value === undefined) {
      return;
    }
    const facetPrefix = /^(f|fExcluded|cf|nf|df|sf|af)-(.+)$/; // TODO: this regex is repeated twice
    const result = facetPrefix.exec(key);
    if (result) {
      const paramKey = result[1];
      const facetId = result[2];
      if (!isSpecificFacetKey(paramKey)) {
        // TODO: merge with regex above
        return;
      }

      const toArray = <T>(value: T | T[]): T[] =>
        Array.isArray(value) ? value : [value];

      const {buildDateRanges, buildNumericRanges} =
        buildSearchParameterRanges();

      if (paramKey === 'nf') {
        searchParams[paramKey] = extendWithArray(
          searchParams[paramKey],
          facetId,
          paramKey,
          buildNumericRanges(toArray(value))
        );
      } else if (paramKey === 'df') {
        searchParams[paramKey] = extendWithArray(
          searchParams[paramKey],
          facetId,
          paramKey,
          buildDateRanges(toArray(value))
        );
      } else {
        searchParams[paramKey] = extendWithArray(
          searchParams[paramKey],
          facetId,
          paramKey,
          toArray(value)
        );
      }
    } else {
      if (isSpecificNonFacetKey(key)) {
        // FIXME: fix type error
        // TODO: try with other search param types (numbers)
        searchParams[key] = value;
      }
    }

    // TODO: rename this method
    function extendWithArray<V>(
      record: Record<string, V[]> = {},
      facetId: string,
      paramKey: SearchParameterKey,
      valueArray: V[]
    ) {
      if (paramKey in searchParams) {
        record[facetId] = [...(record[facetId] || []), ...valueArray];
        return record;
      } else {
        return {[facetId]: valueArray};
      }
    }
  }

  /**
   * Removes Coveo search parameters from the given URL search parameters object and returns the parameters that were removed.
   * @param urlSearchParams - The URL search parameters object to modify.
   * @returns The previous state of Coveo search parameters that was removed from the URL search parameter object.
   */
  private wipeCoveoSearchParamFromUrl(urlSearchParams: URLSearchParams) {
    const previousCoveoSearchParams: FacetValue = {};
    const keysToDelete: string[] = [];

    urlSearchParams.forEach((value, key) => {
      if (value !== undefined && isValidSearchParam(key)) {
        // TODO: value should never be undefiend here! make sure of it
        previousCoveoSearchParams[key] = [
          ...(previousCoveoSearchParams[key] || []),
          value,
        ];
        keysToDelete.push(key);
      }
    });

    for (const key of keysToDelete) {
      urlSearchParams.delete(key);
    }

    return previousCoveoSearchParams;
  }

  private applyToUrlSearchParam(
    urlSearchParams: URLSearchParams,
    previousState: FacetValue,
    pair: [SearchParameterKey, unknown]
  ) {
    if (!pair[1]) {
      return;
    }

    if (isFacetPair(pair)) {
      this.applyFacetValuesToSearchParams(urlSearchParams, previousState, pair);
      return;
    }

    if (isRangeFacetPair(pair)) {
      this.applyRangeFacetValuesToSearchParams(urlSearchParams, pair);
      return;
    }

    urlSearchParams.set(pair[0], pair[1].toString());
  }

  private applyFacetValuesToSearchParams(
    urlSearchParams: URLSearchParams,
    previousState: FacetValue,
    [key, value]: SearchParamPair<FacetValue>
  ) {
    Object.entries(value).forEach(([facetId, facetValues]) => {
      const id = `${key}-${facetId}`;
      const previousFacetValues = previousState[id];

      // The api returns the same values in a different order. We don't need to update the url. reverting back to previous state since we did wipe the url before.
      // This is needed because the api returns the same values in a different order. and this will prevenet having to store a new state to the history if only the sort have changed
      if (
        previousFacetValues &&
        areTheSameArraysSortedDifferently(previousFacetValues, value[facetId])
      ) {
        previousFacetValues.forEach((v) => urlSearchParams.append(id, v));
        // revert back previous state
        return;
      }

      urlSearchParams.delete(id);

      facetValues.forEach((v) => urlSearchParams.append(id, v));
    });
  }

  private applyRangeFacetValuesToSearchParams(
    urlSearchParams: URLSearchParams,
    [key, value]: SearchParamPair<RangeFacetValue>
  ) {
    Object.entries(value).forEach(([facetId, facetValues]) => {
      const id = `${key}-${facetId}`;
      // const previousFacetValues = previousState[id];

      // The api returns the same values in a different order. We don't need to update the url. reverting back to previous state since we did wipe the url before.
      // This is needed because the api returns the same values in a different order. and this will prevenet having to store a new state to the history if only the sort have changed
      // TODO: rework sorting functino to accept objects EVEN IF API DOES NOT REORDER NUMERIC RANGES
      // if (
      //   previousFacetValues &&
      //   areTheSameArraysSortedDifferently(previousFacetValues, value[facetId])
      // ) {
      //   previousFacetValues.forEach((v) => urlSearchParams.append(id, v));
      //   // revert back previous state
      //   return;
      // }

      urlSearchParams.delete(id);

      facetValues.forEach(({start, end, endInclusive}) =>
        urlSearchParams.append(
          id,
          `${start}${
            endInclusive ? rangeDelimiterInclusive : rangeDelimiterExclusive // TODO: check if this can be put in other function
          }${end}`
        )
      );
    });
  }
}
