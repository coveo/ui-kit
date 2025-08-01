import {isNullOrUndefined} from '@coveo/bueno';
import {arrayEqualStrictlyDifferentOrder} from '../../utils/compare-utils.js';
import type {SearchParameters} from './search-parameter-actions.js';
import {
  isValidKey,
  rangeDelimiterExclusive,
  rangeDelimiterInclusive,
  type SearchParameterKey,
} from './search-parameter-serializer.js';
import {
  extendSearchParameters,
  type FacetValueSearchParam,
  isFacetPair,
  isRangeFacetPair,
  isValidSearchParam,
  type RangeFacetValueSearchParam,
  type SearchParamPair,
  type SearchParamValue,
} from './search-parameter-utils.js';

export function buildSSRSearchParameterSerializer() {
  return {toSearchParameters, serialize};
}

/**
 * Converts URLSearchParams or a record of search parameters into a {@link SearchParameters} object.
 *
 * @param urlSearchParams - The URLSearchParams or record of search parameters.
 * @returns The converted SearchParameters object.
 */
function toSearchParameters(
  urlSearchParams: URLSearchParams | Record<string, SearchParamValue>
): SearchParameters {
  const searchParameters: Record<string, unknown> = {};
  const add = (key: string, value: SearchParamValue) =>
    extendSearchParameters(searchParameters, key, value);

  if (urlSearchParams instanceof URLSearchParams) {
    urlSearchParams.forEach((value, key) => add(key, value));
  } else {
    Object.entries(urlSearchParams).forEach(([key, value]) => add(key, value));
  }

  return searchParameters;
}

/**
 * Serializes the search parameters to the provided URL.
 *
 * @param searchParameters - The search parameters to be serialized.
 * @param initialUrl - The initial URL to which the search parameters will be added.
 * @returns The serialized URL.
 */
function serialize(searchParameters: SearchParameters, initialUrl: URL) {
  const {searchParams} = initialUrl;
  const previousState = wipeSearchParamsFromUrl(searchParams);
  Object.entries(searchParameters).forEach(
    ([key, value]) =>
      isValidKey(key) &&
      applyToUrlSearchParam(searchParams, previousState, [key, value])
  );

  return initialUrl.href;
}

function wipeSearchParamsFromUrl(urlSearchParams: URLSearchParams) {
  const previousSearchParams: FacetValueSearchParam = {};
  const keysToDelete: string[] = [];

  urlSearchParams.forEach((value, key) => {
    if (value !== undefined && isValidSearchParam(key)) {
      previousSearchParams[key] = [...(previousSearchParams[key] || []), value];
      keysToDelete.push(key);
    }
  });

  for (const key of keysToDelete) {
    urlSearchParams.delete(key);
  }

  return previousSearchParams;
}

function applyToUrlSearchParam(
  urlSearchParams: URLSearchParams,
  previousState: FacetValueSearchParam,
  pair: [SearchParameterKey, unknown]
) {
  if (isNullOrUndefined(pair[1])) {
    return;
  }

  if (isFacetPair(pair)) {
    applyFacetValuesToSearchParams(urlSearchParams, previousState, pair);
    return;
  }

  if (isRangeFacetPair(pair)) {
    applyRangeFacetValuesToSearchParams(urlSearchParams, pair);
    return;
  }

  urlSearchParams.set(pair[0], `${pair[1] as string | number | boolean}`);
}

function applyFacetValuesToSearchParams(
  urlSearchParams: URLSearchParams,
  previousState: FacetValueSearchParam,
  [key, value]: SearchParamPair<FacetValueSearchParam>
) {
  Object.entries(value).forEach(([facetId, facetValues]) => {
    const id = `${key}-${facetId}`;
    const previousFacetValues = previousState[id] ?? [];

    // Verify whether the API has provided an identical set of values but with a different sorting order. In such a scenario, refrain from updating the URL. Instead, revert to the previous state and disregard the altered state with the modified order. This ensures that a new entry is not added to the history unless there is a change beyond just the sorting order.
    if (arrayEqualStrictlyDifferentOrder(previousFacetValues, value[facetId])) {
      previousFacetValues.forEach((v) => urlSearchParams.append(id, v));
      return;
    }

    urlSearchParams.delete(id);

    facetValues.forEach((v) => urlSearchParams.append(id, v));
  });
}

function applyRangeFacetValuesToSearchParams(
  urlSearchParams: URLSearchParams,
  [key, value]: SearchParamPair<RangeFacetValueSearchParam>
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
