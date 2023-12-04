import {Logger} from 'pino';
import {URLPath} from '../../../utils/url-utils';
import {pickNonBaseParams, unwrapError} from '../../api-client-utils';
import {PlatformClient} from '../../platform-client';
import {PreprocessRequest, RequestMetadata} from '../../preprocess-request';
import {findEncoding} from '../encoding-finder';
import {SearchAPIErrorWithStatusCode} from '../search-api-error-response';
import {baseSearchRequest} from '../search-api-params';
import {HtmlRequest} from './html-request';

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
  if (req.q !== undefined) {
    url.addParam('q', req.q);
  }
  if (req.enableNavigation !== undefined) {
    url.addParam('enableNavigation', `${req.enableNavigation}`);
  }
  if (req.requestedOutputSize !== undefined) {
    url.addParam('requestedOutputSize', `${req.requestedOutputSize}`);
  }
  if (req.visitorId !== undefined) {
    url.addParam('visitorId', `${req.visitorId}`);
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
