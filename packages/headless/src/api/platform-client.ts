import fetch from 'cross-fetch';
export type HttpMethods = 'POST' | 'GET' | 'DELETE' | 'PUT';
export type HTTPContentTypes = 'application/json' | 'text/html';
import {backOff} from 'exponential-backoff';
import {BaseParam} from './search/search-api-params';
import {Logger} from 'pino';

function isThrottled(status: number): boolean {
  return status === 429;
}

export interface BasePlatformClientOptions {
  url: string;
  method: HttpMethods;
  contentType: HTTPContentTypes;
  headers?: Record<string, string>;
}

export interface PlatformClientCallOptions<RequestParams extends BaseParam>
  extends BasePlatformClientOptions {
  requestParams: Omit<RequestParams, 'url' | 'organizationId' | 'accessToken'>;
  accessToken: string;
  renewAccessToken: () => Promise<string>;
  preprocessRequest: PreprocessRequestMiddleware;
  logger: Logger;
  signal?: AbortSignal;
}

export interface PlatformResponse<T> {
  body: T;
  response: Response;
}

export type PreprocessRequestMiddleware = (
  request: BasePlatformClientOptions
) => BasePlatformClientOptions | Promise<BasePlatformClientOptions>;

export const NoopPreprocessRequestMiddleware: PreprocessRequestMiddleware = (
  request
) => request;

export class PlatformClient {
  static async call<RequestParams extends BaseParam, ResponseType>(
    options: PlatformClientCallOptions<RequestParams>
  ): Promise<PlatformResponse<ResponseType>> {
    const processedOptions = {
      ...options,
      ...(await options.preprocessRequest(options)),
    };

    const requestInfo = {
      url: processedOptions.url,
      method: processedOptions.method,
      headers: {
        'Content-Type': processedOptions.contentType,
        Authorization: `Bearer ${processedOptions.accessToken}`,
        ...processedOptions.headers,
      },
      body: processedOptions.requestParams,
    };

    processedOptions.logger.info(requestInfo, 'Platform request');

    const request = async () => {
      const response = await fetch(processedOptions.url, {
        method: processedOptions.method,
        headers: {
          'Content-Type': processedOptions.contentType,
          Authorization: `Bearer ${processedOptions.accessToken}`,
          ...processedOptions.headers,
        },
        body: JSON.stringify(processedOptions.requestParams),
        signal: options.signal,
      });
      if (isThrottled(response.status)) {
        throw response;
      }
      return response;
    };

    try {
      const response = await backOff(request, {
        retry: (e: Response) => {
          const shouldRetry = e && isThrottled(e.status);
          shouldRetry && options.logger.info('Platform retrying request');
          return shouldRetry;
        },
      });
      if (response.status === 419) {
        processedOptions.logger.info('Platform renewing token');
        const accessToken = await processedOptions.renewAccessToken();

        if (accessToken !== '') {
          return PlatformClient.call({...processedOptions, accessToken});
        }
      }

      const body = (await response.json()) as ResponseType;

      options.logger.info({response, body, requestInfo}, 'Platform response');

      return {
        response,
        body,
      };
    } catch (error) {
      if (error.body) {
        return {
          response: error,
          body: await error.json(),
        };
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

/**
 *
 * @param options
 * @docsection Functions
 */
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
