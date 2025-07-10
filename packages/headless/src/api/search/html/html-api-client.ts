import type {Logger} from 'pino';
import {URLPath} from '../../../utils/url-utils.js';
import {pickNonBaseParams, unwrapError} from '../../api-client-utils.js';
import {PlatformClient} from '../../platform-client.js';
import type {
  PreprocessRequest,
  RequestMetadata,
} from '../../preprocess-request.js';
import {findEncoding} from '../encoding-finder.js';
import type {SearchAPIErrorWithStatusCode} from '../search-api-error-response.js';
import {baseSearchRequest} from '../search-api-params.js';
import type {HtmlRequest} from './html-request.js';

export interface HtmlApiClient {
  html: (req: HtmlRequest) => Promise<
    | {
        success: string;
        error?: undefined;
      }
    | {
        error: SearchAPIErrorWithStatusCode;
        success?: undefined;
      }
  >;
}

export interface HtmlAPIClientOptions {
  logger: Logger;
  preprocessRequest: PreprocessRequest;
  requestMetadata?: RequestMetadata;
}

export const buildContentURL = (req: HtmlRequest, path: string) => {
  const url = new URLPath(`${req.url}${path}`);
  url.addParam('access_token', req.accessToken);
  url.addParam('organizationId', req.organizationId);
  url.addParam('uniqueId', req.uniqueId);
  if (req.authentication) {
    url.addParam('authentication', req.authentication);
  }
  if (req.q !== undefined) {
    url.addParam('q', req.q);
  }
  if (req.enableNavigation !== undefined) {
    url.addParam('enableNavigation', `${req.enableNavigation}`);
  }
  if (req.requestedOutputSize !== undefined) {
    url.addParam('requestedOutputSize', `${req.requestedOutputSize}`);
  }
  return url.href;
};

export const getHtml = async (
  req: HtmlRequest,
  options: HtmlAPIClientOptions
) => {
  const response = await PlatformClient.call({
    ...baseSearchRequest(
      req,
      'POST',
      'application/x-www-form-urlencoded',
      '/html'
    ),
    requestParams: pickNonBaseParams(req),
    requestMetadata: {method: 'html'},
    ...options,
  });

  if (response instanceof Error) {
    throw response;
  }

  const encoding = findEncoding(response);
  const buffer = await response.arrayBuffer();
  const decoder = new TextDecoder(encoding);
  const body = decoder.decode(buffer);

  if (isSuccessHtmlResponse(body)) {
    return {success: body};
  }

  return {error: unwrapError({response, body})};
};

function isSuccessHtmlResponse(body: unknown): body is string {
  return typeof body === 'string';
}
