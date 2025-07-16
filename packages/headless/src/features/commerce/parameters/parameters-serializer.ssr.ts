import {isNullOrUndefined} from '@coveo/bueno';
import type {
  DateRangeRequest,
  NumericRangeRequest,
} from '../../../controllers/commerce/core/facets/headless-core-commerce-facet.js';
import {arrayEqualStrictlyDifferentOrder} from '../../../utils/compare-utils.js';
import {isEmptyString} from '../../../utils/utils.js';
import {
  allEntriesAreValid,
  buildDateRanges,
  buildNumericRanges,
  castUnknownObject,
  isFacetObject,
  isObject,
  rangeDelimiterExclusive,
  rangeDelimiterInclusive,
} from '../../search-parameters/search-parameter-serializer.js';
import {
  type SearchParamValue as CommerceSearchParamValue,
  type FacetValueSearchParam,
  toArray,
} from '../../search-parameters/search-parameter-utils.js';
import type {CommerceSearchParameters} from '../search-parameters/search-parameters-actions.js';
import type {SortCriterion} from '../sort/sort.js';
import {
  buildCriterionExpression,
  commerceFacetsRegex,
  deserializeSortCriteria,
  type FacetParameters,
  keyHasObjectValue,
} from './parameters-serializer.js';

type CommerceSearchParametersKey = keyof CommerceSearchParameters;
type CommerceSearchParamPair<T> = [CommerceSearchParametersKey, T];
type RangeFacetValueSearchParam = Record<
  string,
  DateRangeRequest[] | NumericRangeRequest[]
>;

export function buildParameterSerializer() {
  return {deserialize, serialize};
}

/**
 * Converts URLSearchParams or a record of commerce search parameters into a {@link CommerceSearchParameters} object.
 *
 * @param urlCommerceSearchParams - The URLSearchParams or record of commerce search parameters.
 * @returns The converted CommerceSearchParameters object.
 */
function deserialize(
  urlCommerceSearchParams:
    | URLSearchParams
    | Record<string, CommerceSearchParamValue>
): CommerceSearchParameters {
  const commerceSearchParameters: Record<string, unknown> = {};
  const add = (key: string, value: CommerceSearchParamValue) =>
    extendSearchParams(commerceSearchParameters, key, value);

  if (urlCommerceSearchParams instanceof URLSearchParams) {
    urlCommerceSearchParams.forEach((value, key) => add(key, value));
  } else {
    Object.entries(urlCommerceSearchParams).forEach(([key, value]) =>
      add(key, value)
    );
  }

  return commerceSearchParameters;
}

/**
 * Serializes the commerce search parameters to the provided URL.
 *
 * @param commerceSearchParameters - The commerce search parameters to be serialized.
 * @param initialUrl - The initial URL to which the commerce search parameters will be added.
 * @returns The serialized URL.
 */
function serialize(
  commerceSearchParameters: CommerceSearchParameters,
  initialUrl: URL
) {
  initialUrl = new URL(initialUrl);
  const {searchParams} = initialUrl;
  const previousState = wipeSearchParamsFromUrl(searchParams);
  Object.entries(commerceSearchParameters).forEach(
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
  pair: [CommerceSearchParametersKey, unknown]
) {
  if (isNullOrUndefined(pair[1])) {
    return;
  }

  if (isSortPair(pair)) {
    applySortToSearchParams(urlSearchParams, pair);
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

function applySortToSearchParams(
  urlSearchParams: URLSearchParams,
  [key, value]: CommerceSearchParamPair<SortCriterion>
) {
  const sortCriteria = encodeURIComponent(buildCriterionExpression(value));
  urlSearchParams.set(key, sortCriteria);
}

function applyFacetValuesToSearchParams(
  urlSearchParams: URLSearchParams,
  previousState: FacetValueSearchParam,
  [key, value]: CommerceSearchParamPair<FacetValueSearchParam>
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
  [key, value]: CommerceSearchParamPair<RangeFacetValueSearchParam>
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

function isValidKey(key: string): key is CommerceSearchParametersKey {
  return isValidBasicKey(key) || keyHasObjectValue(key);
}

function isValidBasicKey(
  key: string
): key is Exclude<CommerceSearchParametersKey, keyof FacetParameters> {
  const supportedBasicParameters: Record<
    Exclude<CommerceSearchParametersKey, FacetParameters>,
    boolean
  > = {
    q: true,
    sortCriteria: true,
    page: true,
    perPage: true,
  };
  return key in supportedBasicParameters;
}

/**
 * Extends the search parameters with the given key-value pair. If the key-value pair is not valid or if the value is undefined, the search parameters are not modified.
 * @param commerceSearchParams - The search parameters object to extend.
 * @param key - The key of the search parameter.
 * @param value - The value of the search parameter.
 */
function extendSearchParams(
  commerceSearchParams: Record<string, unknown>,
  key: string,
  value: CommerceSearchParamValue
): void {
  if (isNullOrUndefined(value)) {
    return;
  }
  if (key === 'sortCriteria') {
    commerceSearchParams[key] = deserializeSortCriteria(
      decodeURIComponent(value as string)
    );
    return;
  }
  if (
    isValidBasicKey(key) &&
    typeof value === 'string' &&
    !isEmptyString(value)
  ) {
    const [k, v] = cast([key, value], false);
    commerceSearchParams[k] = v;
    return;
  }

  const result = commerceFacetsRegex.exec(key);
  if (result) {
    const paramKey = result[1];
    const facetId = result[2];
    if (!keyHasObjectValue(paramKey)) {
      return;
    }
    const add = addFacetValuesToSearchParams(facetId, paramKey);

    let range: NumericRangeRequest[] | DateRangeRequest[] | string[];

    switch (paramKey) {
      case 'nf':
      case 'mnf':
        range = buildNumericRanges(toArray(value), 'selected');
        break;
      case 'nfExcluded':
      case 'mnfExcluded':
        range = buildNumericRanges(toArray(value), 'excluded');
        break;
      case 'df':
        range = buildDateRanges(toArray(value), 'selected');
        break;
      case 'dfExcluded':
        range = buildDateRanges(toArray(value), 'excluded');
        break;
      default:
        range = toArray(value);
        break;
    }

    add(commerceSearchParams, range);
  }
}

function cast<K extends CommerceSearchParametersKey>(
  pair: [K, string],
  decode = true
): [K, unknown] {
  const [key, value] = pair;

  if (key === 'page') {
    return [key, parseInt(value)];
  }

  if (key === 'perPage') {
    return [key, parseInt(value)];
  }

  if (keyHasObjectValue(key)) {
    return [key, castUnknownObject(value)];
  }

  return [key, decode ? decodeURIComponent(value) : value];
}

function isValidSearchParam(key: string) {
  return commerceFacetsRegex.exec(key) !== null || isValidBasicKey(key);
}

function isSortPair(
  pair: [CommerceSearchParametersKey, unknown]
): pair is CommerceSearchParamPair<SortCriterion> {
  const [key, value] = pair;
  const isValidKey = key === 'sortCriteria';
  const isValidValue = isObject(value) && 'by' in value;
  return isValidKey && isValidValue;
}

function isFacetPair(
  pair: [CommerceSearchParametersKey, unknown]
): pair is CommerceSearchParamPair<FacetValueSearchParam> {
  const [key, value] = pair;
  const isValidKey = keyHasObjectValue(key);
  const isValidValue = isFacetObject(value);
  return isValidKey && isValidValue;
}

const validRangeFacetKeys = [
  'nf',
  'nfExcluded',
  'mnf',
  'mnfExcluded',
  'df',
  'dfExcluded',
];

function isRangeFacetPair(
  pair: [CommerceSearchParametersKey, unknown]
): pair is CommerceSearchParamPair<RangeFacetValueSearchParam> {
  const [key, value] = pair;
  const isValidKey = validRangeFacetKeys.includes(key);
  const isValidValue = isRangeFacetObject(value);
  return isValidKey && isValidValue;
}

function isRangeFacetObject(
  obj: unknown
): obj is Record<string, (DateRangeRequest | NumericRangeRequest)[]> {
  if (!isObject(obj)) {
    return false;
  }

  const isRangeValue = (v: unknown) =>
    isObject(v) && 'start' in v && 'end' in v;
  return allEntriesAreValid(obj, isRangeValue);
}

function addFacetValuesToSearchParams(
  facetId: string,
  paramKey: CommerceSearchParametersKey
) {
  return (searchParams: Record<string, unknown>, valueArray: unknown[]) => {
    if (paramKey in searchParams) {
      const record = (searchParams[paramKey] ?? {}) as Record<
        string,
        unknown[]
      >;
      record[facetId] = [...(record[facetId] ?? []), ...valueArray];
      searchParams[paramKey] = record;
    } else {
      searchParams[paramKey] = {[facetId]: valueArray};
    }
  };
}
