import fetch from 'cross-fetch';
export type HttpMethods = 'POST' | 'GET' | 'DELETE' | 'PUT';
export type HTTPContentType =
  | 'application/json'
  | 'application/x-www-form-urlencoded'
  | 'text/html';
import {backOff} from 'exponential-backoff';
import {Logger} from 'pino';
import {DisconnectedError, ExpiredTokenError} from '../utils/errors';
import {canBeFormUrlEncoded, encodeAsFormUrl} from './form-url-encoder';
import {PlatformRequestOptions, PreprocessRequest} from './preprocess-request';

function isThrottled(status: number): boolean {
  return status === 429;
}

export interface PlatformClientCallOptions {
  url: string;
  method: HttpMethods;
  contentType: HTTPContentType;
  headers?: Record<string, string>;
  requestParams: unknown;
  accessToken: string;
  preprocessRequest: PreprocessRequest;
  logger: Logger;
  signal?: AbortSignal;
}

export interface PlatformResponse<T> {
  body: T;
  response: Response;
}

export type PlatformClientCallError =
  | ExpiredTokenError
  | DisconnectedError
  | Error;

export class PlatformClient {
  static async call(
    options: PlatformClientCallOptions
  ): Promise<Response | PlatformClientCallError> {
    const defaultRequestOptions = buildDefaultRequestOptions(options);
    const {preprocessRequest, logger} = options;

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
        throw new ExpiredTokenError();
      }

      logger.info({response, requestInfo}, 'Platform response');

      return response;
    } catch (error) {
      if (error.message === 'Failed to fetch') {
        return new DisconnectedError();
      }

      return error;
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

function buildDefaultRequestOptions(
  options: PlatformClientCallOptions
): PlatformRequestOptions {
  const {
    url,
    method,
    requestParams,
    contentType,
    accessToken,
    signal,
  } = options;
  const body = encodeBody(requestParams, contentType);

  return {
    url,
    method,
    headers: {
      'Content-Type': contentType,
      Authorization: `Bearer ${accessToken}`,
      ...options.headers,
    },
    body,
    signal,
  };
}

function encodeBody(body: unknown, contentType: HTTPContentType) {
  if (contentType === 'application/x-www-form-urlencoded') {
    return canBeFormUrlEncoded(body) ? encodeAsFormUrl(body) : '';
  }

  return JSON.stringify(body);
}
