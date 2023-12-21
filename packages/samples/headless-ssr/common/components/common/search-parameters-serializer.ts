import {SearchParameters} from '@coveo/headless/ssr';
import type {ReadonlyURLSearchParams} from 'next/navigation';
import {
  doHaveSameValues,
  FacetPair,
  isValidSearchParam,
  isFacetPair,
  isSpecificFacetKey,
  isUrlInstance,
  isValidKey,
  NextJSServerSideSearchParams,
  NextJSServerSideSearchParamsValues,
  processRangesValue,
  removeKeysFromUrlSearchParams,
  SearchParameterKey,
} from './search-parameters-utils';

type PreviousCoveoSearchParamsState = Partial<Record<string, string[]>>;
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
    const coveoSearchParameters: SearchParameters = {}; // TODO: not sure about the type
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
        // THIS does not handle range facets
        return;
      }
      const processedValue = processRangesValue(paramKey, value);
      const valueArray = Array.isArray(processedValue)
        ? processedValue
        : [processedValue];

      if (paramKey in searchParams) {
        const record = searchParams[paramKey] ?? {};
        // TODO: something broke here when selected 2 facets, went back and forward
        record[facetId] = [...(record[facetId] || []), ...valueArray];
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
   * Removes Coveo search parameters from the given URL search parameters object and returns the parameters that were removed.
   * @param urlSearchParams - The URL search parameters object to modify.
   * @returns The previous state of Coveo search parameters that was removed from the URL search parameter object.
   */
  private wipeCoveoSearchParamFromUrl(
    urlSearchParams: URLSearchParams
  ): PreviousCoveoSearchParamsState {
    const previousCoveoSearchParams: PreviousCoveoSearchParamsState = {};
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

    removeKeysFromUrlSearchParams(urlSearchParams, keysToDelete);

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
