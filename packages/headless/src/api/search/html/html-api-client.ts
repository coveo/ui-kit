import {HtmlRequest} from './html-request';
import {SearchAPIErrorWithStatusCode} from '../search-api-error-response';
import {baseSearchRequest} from '../search-api-params';
import {PlatformClient} from '../../platform-client';
import {pickNonBaseParams, unwrapError} from '../search-api-client';
import {findEncoding} from '../encoding-finder';
import {TextDecoder} from 'web-encoding';
import {Logger} from 'pino';
import {PreprocessRequest} from '../../preprocess-request';

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
}

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
