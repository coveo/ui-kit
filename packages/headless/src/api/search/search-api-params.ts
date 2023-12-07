import {history} from 'coveo.analytics';
import {FacetOptions} from '../../features/facet-options/facet-options';
import {AutomaticFacetRequest} from '../../features/facets/automatic-facet-set/interfaces/request';
import {AnyFacetRequest} from '../../features/facets/generic/interfaces/generic-facet-request';
import {GeneratedAnswerStyle} from '../../features/generated-answer/generated-response-format';
import {URLPath} from '../../utils/url-utils';
import {
  HTTPContentType,
  HttpMethods,
  PlatformClientCallOptions,
} from '../platform-client';
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
    actionCause?: string;
    customData?: object;
    clientId: string;
    deviceId?: string;
    pageId?: string;
    clientTimestamp: string;
    documentReferrer: string;
    originContext: string;
    userDisplayName?: string;
    documentLocation?: string;
    trackingId?: string;
    capture?: boolean;
  };
}

export interface ExcerptLength {
  excerptLength?: number;
}

export interface AuthenticationParam {
  authentication?: string;
}
export interface AutomaticFacetsParams {
  generateAutomaticFacets?: {
    desiredCount: number;
    numberOfValues?: number;
    currentFacets?: AutomaticFacetRequest[];
  };
}

export interface PipelineRuleParams {
  pipelineRuleParameters?: PipelineRuleParameters;
}

export interface PipelineRuleParameters {
  mlGenerativeQuestionAnswering?: GenQAParameters;
}

export interface GenQAParameters {
  responseFormat: ResponseFormatParameters;
  citationsFieldToInclude: string[];
}

export interface ResponseFormatParameters {
  answerStyle: GeneratedAnswerStyle;
}

export const baseSearchRequest = (
  req: BaseParam & AuthenticationParam,
  method: HttpMethods,
  contentType: HTTPContentType,
  path: string
): Pick<
  PlatformClientCallOptions,
  'accessToken' | 'method' | 'contentType' | 'url' | 'origin'
> => {
  const url = new URLPath(`${req.url}${path}`);

  url.addParam('organizationId', req.organizationId);

  if (req.authentication) {
    url.addParam('authentication', req.authentication);
  }
  return {
    accessToken: req.accessToken,
    method,
    contentType,
    url: url.href,
    origin: 'searchApiFetch',
  };
};

export const getOrganizationIdQueryParam = (req: BaseParam) =>
  `organizationId=${req.organizationId}`;

export const getAuthenticationQueryParam = (req: AuthenticationParam) =>
  `authentication=${encodeURIComponent(req.authentication!)}`;
