import {backOff} from 'exponential-backoff';
import type {Logger} from 'pino';
import {DisconnectedError, UnauthorizedTokenError} from '../utils/errors.js';
import type {PlatformEnvironment} from '../utils/url-utils.js';
import {clone} from '../utils/utils.js';
import {canBeFormUrlEncoded, encodeAsFormUrl} from './form-url-encoder.js';
import type {
  PlatformClientOrigin,
  PlatformRequestOptions,
  PreprocessRequest,
  RequestMetadata,
} from './preprocess-request.js';

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
  | UnauthorizedTokenError
  | DisconnectedError
  | Error;

// biome-ignore lint/complexity/noStaticOnlyClass: Maybe change this into a function someday. Not worth the effort right now.
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
        startingDelay: 100,
        timeMultiple: 2,
        maxDelay: 800,
        numOfAttempts: 4,
        jitter: 'full',
        retry: async (e: Response) => {
          const shouldRetry = e && isThrottled(e.status);
          if (shouldRetry) {
            logger.info('Platform retrying request');
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
          return shouldRetry;
        },
      });
      switch (response.status) {
        case 419:
        case 401:
          logger.info('Platform renewing token');
          throw new UnauthorizedTokenError();
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
    const {signal: _signal, ...withoutSignal} = defaultRequestOptions;
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

/**
 * Retrieves the endpoint URL for a specific organization.
 *
 * @param organizationId - The ID of the organization.
 * @param environment - The environment of the organization. Defaults to 'prod'.
 * @param endpointType - The type of the endpoint. Defaults to 'platform'.
 * @returns The endpoint URL for the organization.
 */
export function getOrganizationEndpoint(
  organizationId: string,
  environment: PlatformEnvironment = 'prod',
  endpointType: 'admin' | 'analytics' | 'platform' = 'platform'
) {
  const environmentSuffix = environment === 'prod' ? '' : environment;
  const endpointTypePart =
    endpointType === 'platform' ? '' : `.${endpointType}`;

  return `https://${organizationId}${endpointTypePart}.org${environmentSuffix}.coveo.com`;
}

export function getSearchApiBaseUrl(
  organizationId: string,
  environment: PlatformEnvironment = 'prod'
) {
  const organizationEndpoint = getOrganizationEndpoint(
    organizationId,
    environment
  );

  return `${organizationEndpoint}/rest/search/v2`;
}

export function getAnalyticsNextApiBaseUrl(
  organizationId: string,
  environment: PlatformEnvironment = 'prod'
) {
  const organizationEndpoint = getOrganizationEndpoint(
    organizationId,
    environment,
    'analytics'
  );

  return `${organizationEndpoint}/rest/organizations/${organizationId}/events/v1`;
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
