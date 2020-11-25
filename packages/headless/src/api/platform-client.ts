import fetch from 'cross-fetch';
export type HttpMethods = 'POST' | 'GET' | 'DELETE' | 'PUT';
export type HTTPContentTypes = 'application/json' | 'text/html';
import {backOff} from 'exponential-backoff';
import {BaseParam} from './search/search-api-params';
import {Logger} from 'pino';

function isThrottled(status: number): boolean {
  return status === 429;
}
export interface PlatformClientCallOptions<RequestParams extends BaseParam> {
  url: string;
  method: HttpMethods;
  contentType: HTTPContentTypes;
  requestParams: Omit<RequestParams, 'url' | 'organizationId' | 'accessToken'>;
  accessToken: string;
  renewAccessToken: () => Promise<string>;
  logger: Logger;
}

export interface PlatformResponse<T> {
  body: T;
  response: Response;
}

export class PlatformClient {
  static async call<RequestParams extends BaseParam, ResponseType>(
    options: PlatformClientCallOptions<RequestParams>
  ): Promise<PlatformResponse<ResponseType>> {
    const requestInfo = {
      url: options.url,
      method: options.method,
      headers: {
        'Content-Type': options.contentType,
        Authorization: `Bearer ${options.accessToken}`,
      },
      body: options.requestParams,
    };

    options.logger.info(
      requestInfo,
      `@coveo/headless platform request: ${requestInfo.url}`
    );

    const request = async () => {
      const response = await fetch(requestInfo.url, {
        method: requestInfo.method,
        headers: requestInfo.headers,
        body: JSON.stringify(requestInfo.body),
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
          shouldRetry &&
            options.logger.info('@coveo/headless platform retrying request');
          return shouldRetry;
        },
      });
      if (response.status === 419) {
        options.logger.info('@coveo/headless platform renewing token');
        const accessToken = await options.renewAccessToken();

        if (accessToken !== '') {
          return PlatformClient.call({...options, accessToken});
        }
      }

      const body = (await response.json()) as ResponseType;

      options.logger.info(
        {response, body},
        `@coveo/headless platform response: ${requestInfo.url}`
      );

      return {
        response,
        body,
      };
    } catch (error) {
      options.logger.error(
        error,
        `@coveo/headless platform error: ${requestInfo.url}`
      );

      return {
        response: error,
        body: (await error.json()) as ResponseType,
      };
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
