import {pickNonBaseParams} from '../../api-client-utils.js';
import type {
  HTTPContentType,
  HttpMethods,
  PlatformClientCallOptions,
} from '../../platform-client.js';
import type {BaseParam} from '../../platform-service-params.js';
import type {InsightUserActionsRequest} from './user-actions/user-actions-request.js';

export interface InsightIdParam {
  insightId: string;
}

export type InsightParam = BaseParam & InsightIdParam;

export const baseInsightUrl = (req: InsightParam, path?: string) =>
  `${req.url}/rest/organizations/${req.organizationId}/insight/v1/configs/${
    req.insightId
  }${path ?? ''}`;

const baseInsightUserActionsUrl = (req: InsightUserActionsRequest) =>
  `${req.url}/rest/organizations/${req.organizationId}/machinelearning/user/actions`;

export const baseInsightRequest = (
  req: InsightParam,
  method: HttpMethods,
  contentType: HTTPContentType,
  path: string
): Pick<
  PlatformClientCallOptions,
  'accessToken' | 'method' | 'contentType' | 'url' | 'origin'
> => {
  validateInsightRequestParams(req);

  const baseUrl = baseInsightUrl(req, path);

  return {
    accessToken: req.accessToken,
    method,
    contentType,
    url: baseUrl,
    origin: 'insightApiFetch',
  };
};

export const baseInsightUserActionRequest = (
  req: InsightUserActionsRequest,
  method: HttpMethods,
  contentType: HTTPContentType
): Pick<
  PlatformClientCallOptions,
  'accessToken' | 'method' | 'contentType' | 'url' | 'origin'
> => {
  validateInsightUserActionRequestParams(req);

  const baseUrl = baseInsightUserActionsUrl(req);

  return {
    accessToken: req.accessToken,
    method,
    contentType,
    url: baseUrl,
    origin: 'insightApiFetch',
  };
};

export const pickNonInsightParams = (req: InsightParam) => {
  const {insightId: _insightId, ...nonInsightParams} = pickNonBaseParams(req);
  return nonInsightParams;
};

const validateConfigParams = (req: BaseParam) => {
  if (!req.url) {
    throw new Error("The 'url' attribute must contain a valid platform URL.");
  }
  if (!req.organizationId) {
    throw new Error(
      "The 'organizationId' attribute must contain a valid organization ID."
    );
  }
  if (!req.accessToken) {
    throw new Error(
      "The 'accessToken' attribute must contain a valid platform access token."
    );
  }
};

const validateInsightRequestParams = (req: InsightParam) => {
  validateConfigParams(req);
  if (!req.insightId) {
    throw new Error(
      "The 'insightId' attribute must contain a valid Insight Panel configuration ID."
    );
  }
};

const validateInsightUserActionRequestParams = (
  req: InsightUserActionsRequest
) => {
  validateConfigParams(req);
  if (!req.userId) {
    throw new Error("The 'userId' attribute must contain a valid user ID.");
  }
};
