import {pickNonBaseParams} from '../../api-client-utils';
import {HTTPContentType, HttpMethods} from '../../platform-client';
import {BaseParam} from '../../platform-service-params';

export interface InsightIdParam {
  insightId: string;
}

export type InsightParam = BaseParam & InsightIdParam;

export const baseInsightUrl = (req: InsightParam, path: string) =>
  `${req.url}/rest/organizations/${req.organizationId}/insight/v1/configs/${req.insightId}${path}`;

export const baseInsightRequest = (
  req: InsightParam,
  method: HttpMethods,
  contentType: HTTPContentType,
  path: string
) => {
  validateInsightRequestParams(req);

  const baseUrl = baseInsightUrl(req, path);

  return {
    accessToken: req.accessToken,
    method,
    contentType,
    url: baseUrl,
  };
};

export const pickNonInsightParams = (req: InsightParam) => {
  const {insightId, ...nonInsightParams} = pickNonBaseParams(req);
  return nonInsightParams;
};

const validateInsightRequestParams = (req: InsightParam) => {
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
  if (!req.insightId) {
    throw new Error(
      "The 'insightId' attribute must contain a valid Insight Panel configuration ID."
    );
  }
};
