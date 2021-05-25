import {history} from 'coveo.analytics';
import {FacetOptions} from '../../features/facet-options/facet-options';
import {AnyFacetRequest} from '../../features/facets/generic/interfaces/generic-facet-request';
import {HTTPContentType, HttpMethods} from '../platform-client';
import {BaseParam} from '../platform-service-params';

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

export interface EnableQuerySyntaxParam {
  enableQuerySyntax?: boolean;
}

export interface FieldsToIncludeParam {
  fieldsToInclude?: string[];
}

export interface FacetOptionsParam {
  facetOptions?: FacetOptions;
}

export interface TabParam {
  tab: string;
}

export interface RecommendationParam {
  recommendation: string;
}

export interface MachineLearningParam {
  mlParameters: MachineLearningECommerceParameters;
}

export interface MachineLearningECommerceParameters {
  itemIds?: string[];
  categoryFilter?: string;
  brandFilter?: string;
  itemIdsToFilterOut?: string[];
  removeRecentlySeen?: boolean;
  recentlySeenConsideredMinutes?: number;
}

export interface MaximumAgeParam {
  maximumAge: number;
}

export interface ActionsHistoryParam {
  actionsHistory: history.HistoryElement[];
}

export const baseSearchRequest = (
  req: BaseParam,
  method: HttpMethods,
  contentType: HTTPContentType,
  path: string
) => ({
  accessToken: req.accessToken,
  method,
  contentType,
  url: `${req.url}${path}?${getOrganizationIdQueryParam(req)}`,
});

export const getOrganizationIdQueryParam = (req: BaseParam) =>
  `organizationId=${req.organizationId}`;
