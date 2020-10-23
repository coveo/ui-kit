import {FacetOptions} from '../../features/facet-options/facet-options';
import {AnyFacetRequest} from '../../features/facets/generic/interfaces/generic-facet-request';
import {HTTPContentTypes, HttpMethods} from '../platform-client';

export interface BaseParam {
  url: string;
  accessToken: string;
  organizationId: string;
}

export interface ContextParam {
  context?: Record<string, string | string[]>;
}

export interface QueryParam {
  q?: string;
}

export interface PipelineParam {
  pipeline?: string;
}

export interface SearchHubParam {
  searchHub?: string;
}

export interface AdvancedQueryParam {
  aq?: string;
}

export interface ConstantQueryParam {
  cq?: string;
}

export interface NumberOfResultsParam {
  numberOfResults?: number;
}

export interface SortCriteriaParam {
  sortCriteria?: string;
}

export interface FirstResultParam {
  firstResult?: number;
}

export interface FacetsParam {
  facets?: AnyFacetRequest[];
}

export interface EnableDidYouMeanParam {
  enableDidYouMean?: boolean;
}

export interface FieldsToIncludeParam {
  fieldsToInclude?: string[];
}

export interface VisitorIDParam {
  visitorId?: string;
}

export interface FacetOptionsParam {
  facetOptions?: FacetOptions;
}

export const baseSearchRequest = (
  req: BaseParam,
  method: HttpMethods,
  contentType: HTTPContentTypes,
  path: string
) => ({
  accessToken: req.accessToken,
  method,
  contentType,
  url: `${req.url}${path}?${getOrganizationIdQueryParam(req)}`,
});

export const getOrganizationIdQueryParam = (req: BaseParam) =>
  `organizationId=${req.organizationId}`;
