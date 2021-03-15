import fetch from 'cross-fetch';
export type HttpMethods = 'POST' | 'GET' | 'DELETE' | 'PUT';
export type HTTPContentTypes = 'application/json' | 'text/html';
import {backOff} from 'exponential-backoff';
import {Logger} from 'pino';
import {PlatformRequestOptions, PreprocessRequest} from './preprocess-request';

function isThrottled(status: number): boolean {
  return status === 429;
}

export interface PlatformClientCallOptions {
  url: string;
  method: HttpMethods;
  contentType: HTTPContentTypes;
  headers?: Record<string, string>;
  requestParams: unknown;
  accessToken: string;
  renewAccessToken: () => Promise<string>;
  preprocessRequest: PreprocessRequest;
  deprecatedPreprocessRequest: PreprocessRequestMiddleware;
  logger: Logger;
  signal?: AbortSignal;
}

export interface PlatformResponse<T> {
  body: T;
  response: Response;
}

export type PreprocessRequestMiddleware = (
  request: PlatformClientCallOptions
) => PlatformClientCallOptions | Promise<PlatformClientCallOptions>;

export const NoopPreprocessRequestMiddleware: PreprocessRequestMiddleware = (
  request
) => request;

export class PlatformClient {
  static async call(options: PlatformClientCallOptions): Promise<Response> {
    // TODO: use options directly when removing deprecatedPreprocessRequest
    const processedOptions = {
      ...options,
      ...(await options.deprecatedPreprocessRequest(options)),
    };

    const {preprocessRequest, logger} = options;
    const defaultRequestOptions: PlatformRequestOptions = {
      url: processedOptions.url,
      method: processedOptions.method,
      headers: {
        'Content-Type': processedOptions.contentType,
        Authorization: `Bearer ${processedOptions.accessToken}`,
        ...processedOptions.headers,
      },
      body: JSON.stringify(processedOptions.requestParams),
      signal: processedOptions.signal,
    };

    const requestInfo: PlatformRequestOptions = {
      ...defaultRequestOptions,
      ...(preprocessRequest
        ? await preprocessRequest(defaultRequestOptions, 'searchApiFetch')
        : {}),
    };
    logger.info(requestInfo, 'Platform request');

    const {url, ...requestData} = requestInfo;
    const request = async () => {
      const response = await fetch(url, requestData);
      if (isThrottled(response.status)) {
        throw response;
      }
      return response;
    };

    try {
      const response = await backOff(request, {
        retry: (e: Response) => {
          const shouldRetry = e && isThrottled(e.status);
          shouldRetry && logger.info('Platform retrying request');
          return shouldRetry;
        },
      });
      if (response.status === 419) {
        logger.info('Platform renewing token');
        const accessToken = await processedOptions.renewAccessToken();

        if (accessToken !== '') {
          return PlatformClient.call({...processedOptions, accessToken});
        }
      }

      logger.info({response, requestInfo}, 'Platform response');

      return response;
    } catch (error) {
      if (error.body) {
        return error;
      }

      throw error;
    }
  }
}

type PlatformCombination =
  | {env: 'dev'; region: 'us-east-1' | 'eu-west-1' | 'eu-west-3'}
  | {env: 'qa'; region: 'us-east-1' | 'eu-west-1' | 'ap-southeast-2'}
  | {env: 'hipaa'; region: 'us-east-1'}
  | {env: 'prod'; region: 'us-east-1' | 'us-west-2' | 'eu-west-1'};

type PlatformEnvironment = PlatformCombination['env'];

export function platformUrl<E extends PlatformEnvironment = 'prod'>(options?: {
  environment?: E;
  region?: Extract<PlatformCombination, {env: E}>['region'];
}) {
  const urlEnv =
    !options || !options.environment || options.environment === 'prod'
      ? ''
      : options.environment;
  const urlRegion =
    !options || !options.region || options.region === 'us-east-1'
      ? ''
      : `-${options.region}`;

  return `https://platform${urlEnv}${urlRegion}.cloud.coveo.com`;
}
