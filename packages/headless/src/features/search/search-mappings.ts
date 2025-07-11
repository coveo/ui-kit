import {
  formatRelativeDateForSearchApi,
  isRelativeDateFormat,
} from '../../api/search/date/relative-date.js';
import type {SearchRequest} from '../../api/search/search/search-request.js';
import type {SearchResponseSuccess} from '../../api/search/search/search-response.js';
import type {SearchAPIClientResponse} from '../../api/search/search-api-client.js';
import type {SearchAPIErrorWithStatusCode} from '../../api/search/search-api-error-response.js';
import type {FacetsParam} from '../../api/search/search-api-params.js';
import type {AnyFacetRequest} from '../facets/generic/interfaces/generic-facet-request.js';
import type {AnyFacetResponse} from '../facets/generic/interfaces/generic-facet-response.js';
import {
  type DateRangeRequest,
  isDateFacetRequest,
} from '../facets/range-facets/date-facet-set/interfaces/request.js';
import type {
  DateFacetResponse,
  DateFacetValue,
} from '../facets/range-facets/date-facet-set/interfaces/response.js';

function formatStartFacetValue(value: string) {
  return `start${value}`;
}

function formatEndFacetValue(value: string) {
  return `end${value}`;
}

export interface SearchMappings {
  dateFacetValueMap: Record<string, Record<string, string>>;
}

export const initialSearchMappings: () => SearchMappings = () => ({
  dateFacetValueMap: {},
});

function mapDateRangeRequest(
  value: DateRangeRequest,
  facetId: string,
  mappings: SearchMappings
) {
  let start = value.start;
  let end = value.end;
  if (isRelativeDateFormat(start)) {
    start = formatRelativeDateForSearchApi(start);
    mappings.dateFacetValueMap[facetId][formatStartFacetValue(start)] =
      value.start;
  }
  if (isRelativeDateFormat(end)) {
    end = formatRelativeDateForSearchApi(end);
    mappings.dateFacetValueMap[facetId][formatEndFacetValue(end)] = value.end;
  }

  return {...value, start, end};
}

export function mapFacetRequest(
  facetRequest: AnyFacetRequest,
  mappings: SearchMappings
) {
  if (isDateFacetRequest(facetRequest)) {
    const {facetId, currentValues} = facetRequest;
    mappings.dateFacetValueMap[facetId] = {};
    return {
      ...facetRequest,
      currentValues: currentValues.map((value) =>
        mapDateRangeRequest(value, facetId, mappings)
      ),
    };
  }

  return facetRequest;
}

export interface MappedSearchRequest<T extends FacetsParam = SearchRequest> {
  request: T;
  mappings: SearchMappings;
}

export function mapSearchRequest<T extends FacetsParam = SearchRequest>(
  searchRequest: T
): MappedSearchRequest<T> {
  const mappings = initialSearchMappings();
  const request: T = {
    ...searchRequest,
    facets: searchRequest.facets?.map((facetRequest) =>
      mapFacetRequest(facetRequest, mappings)
    ),
  };
  return {request, mappings};
}

function mapDateRangeResponse(
  value: DateFacetValue,
  facetId: string,
  mappings: SearchMappings
) {
  return {
    ...value,
    start:
      mappings.dateFacetValueMap[facetId][formatStartFacetValue(value.start)] ||
      value.start,
    end:
      mappings.dateFacetValueMap[facetId][formatEndFacetValue(value.end)] ||
      value.end,
  };
}

function isDateFacetResponse(
  facetResponse: AnyFacetResponse,
  mappings: SearchMappings
): facetResponse is DateFacetResponse {
  return facetResponse.facetId in mappings.dateFacetValueMap;
}

function mapFacetResponse(
  facetResponse: AnyFacetResponse,
  mappings: SearchMappings
) {
  if (isDateFacetResponse(facetResponse, mappings)) {
    return {
      ...facetResponse,
      values: facetResponse.values.map((value) =>
        mapDateRangeResponse(value, facetResponse.facetId, mappings)
      ),
    };
  }
  return facetResponse;
}

export type ErrorResponse = {
  error: SearchAPIErrorWithStatusCode;
};
export type SuccessResponse = {
  success: SearchResponseSuccess;
};

export function mapSearchResponse<
  ResponseSuccess extends SearchAPIClientResponse<SearchResponseSuccess>,
>(
  response: ResponseSuccess,
  mappings: SearchMappings
): SuccessResponse | ErrorResponse {
  if ('success' in response) {
    const success: SearchResponseSuccess = {
      ...response.success,
      facets: response.success.facets?.map((facetResponse) =>
        mapFacetResponse(facetResponse, mappings)
      ),
    };
    return {success};
  }

  return response;
}
