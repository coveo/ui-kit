//TODO V3: remove this import, global fetch is a requirement now.
//@ts-expect-error package is just an alias.
import fetch from '@coveo/please-give-me-fetch';
import {backOff} from 'exponential-backoff';
import {Logger} from 'pino';
import {DisconnectedError, ExpiredTokenError} from '../utils/errors';
import {PlatformEnvironment} from '../utils/url-utils';
import {clone} from '../utils/utils';
import {canBeFormUrlEncoded, encodeAsFormUrl} from './form-url-encoder';
import {
  PlatformClientOrigin,
  PlatformRequestOptions,
  PreprocessRequest,
  RequestMetadata,
} from './preprocess-request';

export type HttpMethods = 'POST' | 'GET' | 'DELETE' | 'PUT';
export type HTTPContentType =
  | 'application/json'
  | 'application/x-www-form-urlencoded'
  | 'text/html';

function isThrottled(status: number): boolean {
  return status === 429;
}

export interface PlatformClientCallOptions<T = Record<string, unknown>> {
  origin: PlatformClientOrigin;
  url: string;
  method: HttpMethods;
  contentType: HTTPContentType;
  headers?: Record<string, string>;
  requestParams: T;
  accessToken: string;
  preprocessRequest: PreprocessRequest;
  requestMetadata?: RequestMetadata;
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
    const {logger} = options;

    const requestInfo = await PlatformClient.preprocessRequest(
      defaultRequestOptions,
      options
    );

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
      switch (response.status) {
        case 419:
        case 401:
          logger.info('Platform renewing token');
          throw new ExpiredTokenError();
        case 404:
          throw new DisconnectedError(url, response.status);
        default:
          logger.info({response, requestInfo}, 'Platform response');
          return response;
      }
    } catch (error) {
      if ((error as PlatformClientCallError).message === 'Failed to fetch') {
        return new DisconnectedError(url);
      }

      return error as PlatformClientCallError;
    }
  }

  private static async preprocessRequest(
    defaultRequestOptions: PlatformRequestOptions,
    options: PlatformClientCallOptions
  ) {
    const {origin, preprocessRequest, logger, requestMetadata} = options;
    const {signal, ...withoutSignal} = defaultRequestOptions;
    const untaintedOutput: PlatformRequestOptions = clone(withoutSignal);

    try {
      const processedRequest = await preprocessRequest(
        defaultRequestOptions,
        origin,
        requestMetadata
      );
      return {
        ...defaultRequestOptions,
        ...processedRequest,
      };
    } catch (e) {
      logger.error(
        e as Error,
        'Platform request preprocessing failed. Returning default request options.'
      );
    }
    return untaintedOutput;
  }
}

export function getDefaultOrganizationEndpointBaseUrl(
  organizationId: string,
  endpointType: 'admin' | 'analytics' | 'platform',
  environment: PlatformEnvironment = 'prod'
) {
  const environmentSuffix = environment === 'prod' ? '' : environment;
  const endpointTypePart =
    endpointType === 'platform' ? '' : `.${endpointType}`;

  return `https://${organizationId}${endpointTypePart}.org${environmentSuffix}.coveo.com`;
}

export function getDefaultSearchEndpointBaseUrl(
  organizationId: string,
  environment: PlatformEnvironment = 'prod'
) {
  const baseUrl = getDefaultOrganizationEndpointBaseUrl(
    organizationId,
    'platform',
    environment
  );

  return `${baseUrl}/rest/search/v2`;
}

export function getDefaultAnalyticsNextEndpointBaseUrl(
  organizationId: string,
  environment: PlatformEnvironment = 'prod'
) {
  const baseUrl = getDefaultOrganizationEndpointBaseUrl(
    organizationId,
    'analytics',
    environment
  );

  return `${baseUrl}/rest/organizations/${organizationId}/events/v1`;
}

function buildDefaultRequestOptions(
  options: PlatformClientCallOptions
): PlatformRequestOptions {
  const {url, method, requestParams, contentType, accessToken, signal} =
    options;
  const isMethodWithBody =
    options.method === 'POST' || options.method === 'PUT';
  const body = encodeBody(requestParams, contentType);

  return {
    url,
    method,
    headers: {
      'Content-Type': contentType,
      Authorization: `Bearer ${accessToken}`,
      ...options.headers,
    },
    ...(isMethodWithBody && {body}),
    signal,
  };
}

function encodeBody(body: unknown, contentType: HTTPContentType) {
  if (contentType === 'application/x-www-form-urlencoded') {
    return canBeFormUrlEncoded(body) ? encodeAsFormUrl(body) : '';
  }

  return JSON.stringify(body);
}
