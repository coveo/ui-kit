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

export interface LargeQueryParam {
  lq?: string;
}

export interface DisjunctionQueryParam {
  dq?: string;
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

export interface ReferrerParam {
  referrer: string;
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
  actionsHistory?: history.HistoryElement[];
}

export interface TimezoneParam {
  timezone: string;
}

export interface AnalyticsParam {
  analytics?: {
    clientId: string;
    deviceId?: string;
    pageId?: string;
    clientTimestamp: string;
    documentReferrer: string;
    originContext: string;
    userDisplayName?: string;
    documentLocation?: string;
  };
}

export interface ExcerptLength {
  excerptLength?: number;
}

export interface AuthenticationParam {
  authentication?: string;
}

export const baseSearchRequest = (
  req: BaseParam & AuthenticationParam,
  method: HttpMethods,
  contentType: HTTPContentType,
  path: string
) => {
  return {
    accessToken: req.accessToken,
    method,
    contentType,
    url: `${req.url}${path}?${getOrganizationIdQueryParam(req)}${
      req.authentication ? `&${getAuthenticationQueryParam(req)}` : ''
    }`,
  };
};

export const getOrganizationIdQueryParam = (req: BaseParam) =>
  `organizationId=${req.organizationId}`;

export const getAuthenticationQueryParam = (req: AuthenticationParam) =>
  `authentication=${encodeURIComponent(req.authentication!)}`;
