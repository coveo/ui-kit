import type {FacetOptions} from '../../features/facet-options/facet-options.js';
import type {AutomaticFacetRequest} from '../../features/facets/automatic-facet-set/interfaces/request.js';
import type {AnyFacetRequest} from '../../features/facets/generic/interfaces/generic-facet-request.js';
import type {GeneratedContentFormat} from '../../features/generated-answer/generated-response-format.js';
import {URLPath} from '../../utils/url-utils.js';
import type {HistoryElement} from '../analytics/coveo.analytics/history-store.js';
import type {
  HTTPContentType,
  HttpMethods,
  PlatformClientCallOptions,
} from '../platform-client.js';
import type {BaseParam} from '../platform-service-params.js';

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

export interface QueryCorrectionParam {
  queryCorrection?: {
    enabled?: boolean;
    options?: {automaticallyCorrect?: 'never' | 'whenNoResults'};
  };
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
  referrer: string | null;
}

export interface RecommendationParam {
  recommendation: string;
}

export interface ActionsHistoryParam {
  actionsHistory?: HistoryElement[];
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
    documentReferrer: string | null;
    originContext: string;
    userDisplayName?: string;
    documentLocation?: string | null;
    trackingId?: string;
    capture?: boolean;
    source?: string[];
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

type PipelineRuleParameters = {
  mlGenerativeQuestionAnswering?: GenQAParameters;
};

type GenQAParameters = {
  responseFormat: ResponseFormatParameters;
  citationsFieldToInclude: string[];
};

type ResponseFormatParameters = {
  contentFormat?: GeneratedContentFormat[];
};

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
