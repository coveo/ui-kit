import {SearchParameters} from '@coveo/headless/ssr';
import {
  SearchParamPair,
  isValidSearchParam,
  isFacetPair,
  isValidKey,
  ServerSideSearchParams,
  ServerSideSearchParamsValues,
  SearchParameterKey,
  areTheSameArraysSortedDifferently,
  isRangeFacetPair,
  rangeDelimiterInclusive,
  rangeDelimiterExclusive,
  FacetValue,
  RangeFacetValue,
  extendSearchParameters,
} from './search-parameter-utils';

export class SearchParameterSerializer {
  private constructor(public readonly searchParameters: SearchParameters) {}

  /**
   * Converts a {@link SearchParameters} object to a {@link SearchParameterSerializer} object.
   * This class can help you serialize and deserialize Coveo search parameters to and from URL search parameters.
   *
   * @param searchParameters - The {@link SearchParameters} object to convert.
   * @returns A new instance of {@link SearchParameterSerializer}.
   */
  public static fromSearchParameters(searchParameters: SearchParameters) {
    return new SearchParameterSerializer(searchParameters);
  }

  /**
   * Converts URL search parameters into a {@link SearchParameterSerializer} object.
   * This class can help you serialize and deserialize Coveo search parameters to and from URL search parameters.
   *
   * @param urlSearchParams - The URL search parameters to convert.
   * @returns A {@link SearchParameterSerializer} instance with the converted search parameters.
   */
  public static fromUrlSearchParameters(
    urlSearchParams: URLSearchParams | ServerSideSearchParams
  ) {
    const searchParameters: Record<string, unknown> = {};
    const add = (key: string, value: ServerSideSearchParamsValues) =>
      extendSearchParameters(searchParameters, key, value);

    if (urlSearchParams instanceof URLSearchParams) {
      urlSearchParams.forEach((value, key) => add(key, value));
    } else {
      Object.entries(urlSearchParams).forEach(([key, value]) =>
        add(key, value)
      );
    }

    return new SearchParameterSerializer(searchParameters);
  }

  /**
   * Applies the Coveo search parameters to the given URLSearchParams object.
   * This method mutates the given URLSearchParams object.
   *
   * @param urlSearchParams - The URLSearchParams object to apply the new search parameters to.
   */
  public applyToUrlSearchParams(urlSearchParams: URLSearchParams) {
    const previousState = this.wipeSearchParamsFromUrl(urlSearchParams);
    const newState = this.searchParameters;
    Object.entries(newState).forEach(
      ([key, value]) =>
        isValidKey(key) &&
        this.applyToUrlSearchParam(urlSearchParams, previousState, [key, value])
    );
  }

  private wipeSearchParamsFromUrl(urlSearchParams: URLSearchParams) {
    const previousSearchParams: FacetValue = {};
    const keysToDelete: string[] = [];

    urlSearchParams.forEach((value, key) => {
      if (value !== undefined && isValidSearchParam(key)) {
        previousSearchParams[key] = [
          ...(previousSearchParams[key] || []),
          value,
        ];
        keysToDelete.push(key);
      }
    });

    for (const key of keysToDelete) {
      urlSearchParams.delete(key);
    }

    return previousSearchParams;
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
      const previousFacetValues = previousState[id] ?? [];

      // Verify whether the API has provided an identical set of values but with a different sorting order. In such a scenario, refrain from updating the URL. Instead, revert to the previous state and disregard the altered state with the modified order. This ensures that a new entry is not added to the history unless there is a change beyond just the sorting order.
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
