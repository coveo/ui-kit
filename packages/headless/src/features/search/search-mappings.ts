import {
  formatRelativeDateForSearchApi,
  isRelativeDateFormat,
} from '../../api/search/date/relative-date';
import {SearchAPIClientResponse} from '../../api/search/search-api-client';
import {SearchRequest} from '../../api/search/search/search-request';
import {SearchResponseSuccess} from '../../api/search/search/search-response';
import {AnyFacetRequest} from '../facets/generic/interfaces/generic-facet-request';
import {AnyFacetResponse} from '../facets/generic/interfaces/generic-facet-response';
import {
  DateRangeRequest,
  isDateFacetRequest,
} from '../facets/range-facets/date-facet-set/interfaces/request';
import {
  DateFacetResponse,
  DateFacetValue,
} from '../facets/range-facets/date-facet-set/interfaces/response';

function formatStartFacetValue(value: string) {
  return `start${value}`;
}

function formatEndFacetValue(value: string) {
  return `end${value}`;
}

interface SearchMappings {
  dateFacetValueMap: Record<string, Record<string, string>>;
}

const initialSearchMappings: () => SearchMappings = () => ({
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

function mapFacetRequest(
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

export function mapSearchRequest(searchRequest: SearchRequest) {
  const mappings = initialSearchMappings();
  const request: SearchRequest = {
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

export function mapSearchResponse(
  response: SearchAPIClientResponse<SearchResponseSuccess>,
  mappings: SearchMappings
) {
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
