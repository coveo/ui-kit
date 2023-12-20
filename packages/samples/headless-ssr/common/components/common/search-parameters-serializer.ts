import {RangeValueRequest} from '@coveo/headless/dist/definitions/features/facets/range-facets/generic/interfaces/range-facet';
import {type SearchParameters} from '@coveo/headless/ssr';
import {ReadonlyURLSearchParams} from 'next/navigation';
import {
  NextJSServerSideSearchParams,
  SearchParameterKey,
  isSpecificFacetKey,
  allEntriesAreValid,
  isObject,
  isValidKey,
  processObjectValue,
  NextJSServerSideSearchParamsValues,
} from './search-parameters-utils';

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
    const {isUrl, parseSearchParametersHelper} =
      CoveoNextJsSearchParametersSerializer;
    const coveoSearchParameters: SearchParameters = {}; // TODO: not sure about the type
    const parse = (key: string, value: NextJSServerSideSearchParamsValues) =>
      parseSearchParametersHelper(coveoSearchParameters, key, value);

    if (isUrl(clientSideUrlSearchParams)) {
      clientSideUrlSearchParams.forEach((value, key) => parse(key, value));
    } else {
      Object.entries(clientSideUrlSearchParams).forEach(([key, value]) =>
        parse(key, value)
      );
    }

    return new CoveoNextJsSearchParametersSerializer(coveoSearchParameters);
  }

  // TODO: do not return key to delete anymore.
  /**
   * TODO: mension that this also mutate the initial object
   *
   * @param {SearchParameters} res
   * @param {string} key
   * @param {NextJSServerSideSearchParamsValues} value
   * @return {*}  {(string | undefined)}
   */
  private static parseSearchParametersHelper(
    res: SearchParameters,
    key: string,
    value: NextJSServerSideSearchParamsValues
  ): string | undefined {
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

      if (paramKey in res) {
        const record = {...res[paramKey]};
        record[facetId] = [...record[facetId], ...valueArray];
        res[paramKey] = record;
      } else {
        res[paramKey] = {[facetId]: valueArray};
      }
      return key;
    } else {
      if (isValidKey(key)) {
        // FIXME: fix type error
        res[key] = value;
        return key;
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
    Object.entries(this.coveoSearchParameters).forEach(
      ([key, value]) =>
        isValidKey(key) &&
        this.applyToUrlSearchParam(urlSearchParams, key, value)
    );
  }

  private static isUrl(
    a: unknown
  ): a is URLSearchParams | ReadonlyURLSearchParams {
    return a instanceof URLSearchParams || a instanceof ReadonlyURLSearchParams;
  }

  /**
   * function that checks if two arrays contains the same values regardless of their order
   */
  private doHaveSameValues<T>(arr1: T[], arr2: T[]): boolean {
    return (
      arr1.length === arr2.length && arr1.every((value) => arr2.includes(value))
    );
  }

  private applyToUrlSearchParam(
    urlSearchParams: URLSearchParams,
    key: SearchParameterKey,
    value: SearchParameters[typeof key]
  ) {
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
      const searchParamValues = urlSearchParams.getAll(id);

      if (this.doHaveSameValues(searchParamValues, value[facetId])) {
        return;
      }

      urlSearchParams.delete(id);

      facetValues.forEach(
        (v) => !searchParamValues.includes(v) && urlSearchParams.append(id, v)
      );
    });
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

  private applyRangeFacetValuesToSearchParams(
    _value: Record<string, RangeValueRequest[]>,
    _key: string,
    _urlSearchParams: URLSearchParams
  ) {
    // if (this.containsSameValues(urlSearchParams.getAll(id), value[facetId])) {
    //   return;
    // }
    throw 'TODO: To implement';
  }
}
