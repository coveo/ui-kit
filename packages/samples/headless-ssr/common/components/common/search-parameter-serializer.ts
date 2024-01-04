import {
  buildSearchParameterRanges,
  SearchParameters,
} from '@coveo/headless/ssr';
import type {ReadonlyURLSearchParams} from 'next/navigation';
import {
  SearchParamPair,
  isValidSearchParam,
  isFacetPair,
  isValidFacetKey,
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
  isValidBasicKey,
  facetSearchParamRegex,
  toArray,
  addFacetValuesToSearchParams,
} from './search-parameter-utils';

export class CoveoNextJsSearchParameterSerializer {
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
    return new CoveoNextJsSearchParameterSerializer(coveoSearchParameters);
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
      CoveoNextJsSearchParameterSerializer.extendSearchParameters(
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

    return new CoveoNextJsSearchParameterSerializer(coveoSearchParameters);
  }

  /**
   * Applies the Coveo search parameters to the given URLSearchParams object.
   * This method mutates the given URLSearchParams object.
   *
   * @param urlSearchParams - The URLSearchParams object to apply the new search parameters to.
   */
  public applyToUrlSearchParams(urlSearchParams: URLSearchParams) {
    console.log('urlSearchParams ->', urlSearchParams.toString());
    const previousState = this.wipeCoveoSearchParamFromUrl(urlSearchParams);
    const newState = this.coveoSearchParameters;
    Object.entries(newState).forEach(
      ([key, value]) =>
        isValidKey(key) &&
        this.applyToUrlSearchParam(urlSearchParams, previousState, [key, value])
    );
    console.groupEnd();
  }

  private static extendSearchParameters(
    searchParams: Record<string, unknown>,
    key: string,
    value: NextJSServerSideSearchParamsValues
  ): void {
    if (value === undefined) {
      return;
    }
    if (isValidBasicKey(key)) {
      searchParams[key] = value;
      return;
    }

    const result = facetSearchParamRegex.exec(key);
    if (result) {
      const paramKey = result[1];
      const facetId = result[2];
      if (!isValidFacetKey(paramKey)) {
        return;
      }
      const add = addFacetValuesToSearchParams(facetId, paramKey);

      const {buildDateRanges, buildNumericRanges} =
        buildSearchParameterRanges();

      const range =
        paramKey === 'nf'
          ? buildNumericRanges(toArray(value))
          : paramKey === 'df'
            ? buildDateRanges(toArray(value))
            : toArray(value);

      add(searchParams, range);
    }
  }

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

    console.log('previousState   ->', JSON.stringify(previousState));
    console.log(pair);

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
      const previousFacetValues = previousState[id] ?? [];

      // The API returns the same values in a different order. If the previous facet values are the same but sorted differently, we don't want to update the URL. Instead, we revert back to the previous state since we wiped the URL before. This prevents pushing a new entry to the history if only the sort order has changed.
      if (
        areTheSameArraysSortedDifferently(previousFacetValues, value[facetId])
      ) {
        previousFacetValues.forEach((v) => urlSearchParams.append(id, v));
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

      urlSearchParams.delete(id);

      facetValues.forEach(({start, end, endInclusive}) =>
        urlSearchParams.append(
          id,
          `${start}${
            endInclusive ? rangeDelimiterInclusive : rangeDelimiterExclusive
          }${end}`
        )
      );
    });
  }
}
