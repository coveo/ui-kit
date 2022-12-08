import {Logger} from 'pino';
import {TextDecoder} from 'web-encoding';
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

export const buildSrcPath = (req: HtmlRequest, path: string) => {
  // eslint-disable-next-line node/no-unsupported-features/node-builtins
  const url = new URL(`${req.url}${path}`);
  url.searchParams.append('access_token', req.accessToken);
  url.searchParams.append('organizationId', req.organizationId);
  url.searchParams.append('uniqueId', req.uniqueId);
  if (req.q !== undefined) {
    url.searchParams.append('q', req.q);
  }
  if (req.enableNavigation !== undefined) {
    url.searchParams.append('enableNavigation', `${req.enableNavigation}`);
  }
  if (req.requestedOutputSize !== undefined) {
    url.searchParams.append(
      'requestedOutputSize',
      `${req.requestedOutputSize}`
    );
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
