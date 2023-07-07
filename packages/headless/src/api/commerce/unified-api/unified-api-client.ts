import {Logger} from 'pino';
import {
  Badges,
  Recommendations,
} from '../../../features/placement-set/placement-set-interface';
import {PlatformClient} from '../../platform-client';
import {PreprocessRequest} from '../../preprocess-request';
import {BadgingRequest} from './badging/badging-request';
import {RecsRequest} from './recs/recs-request';
import {
  UnifiedCommerceAPIError,
  buildAPIResponseFromErrorOrThrow,
} from './unified-api-error-response';
import {
  baseUnifiedAPIRequest,
  pickNonBaseUnifiedAPIParams,
} from './unified-api-params';

export type CommerceUnifiedAPIResponse<TSuccessContent> =
  | CommerceUnifiedAPISuccessResponse<TSuccessContent>
  | CommerceUnifiedAPIErrorResponse;

export interface CommerceUnifiedAPISuccessResponse<TContent> {
  success: TContent;
}

export interface CommerceUnifiedAPIErrorResponse {
  error: CommerceUnifiedAPIErrorStatusResponse;
}

export interface CommerceUnifiedAPIErrorStatusResponse {
  message: string;
}

export interface CommerceUnifiedAPIClientOptions {
  logger: Logger;
  preprocessRequest: PreprocessRequest;
}

export type CommerceUnifiedAPIClientResponse<T> =
  | {success: T}
  | {error: UnifiedCommerceAPIError};

export class CommerceUnifiedAPIClient {
  constructor(private options: CommerceUnifiedAPIClientOptions) {}

  async getRecs(
    req: RecsRequest
  ): Promise<CommerceUnifiedAPIClientResponse<Recommendations>> {
    const response = await PlatformClient.call({
      ...baseUnifiedAPIRequest(req, `/recommendations/${req.placementId}`),
      method: 'POST',
      contentType: 'application/json',
      requestParams: pickNonBaseUnifiedAPIParams(req),
      ...this.options,
    });

    if (response instanceof Error) {
      return buildAPIResponseFromErrorOrThrow(response);
    }
    const body = await response.json();

    return response.ok
      ? {success: body as Recommendations}
      : {error: body as UnifiedCommerceAPIError};
  }

  async getBadges(
    req: BadgingRequest
  ): Promise<CommerceUnifiedAPIClientResponse<Badges>> {
    const response = await PlatformClient.call({
      ...baseUnifiedAPIRequest(req, `/badging/${req.placementId}`),
      method: 'POST',
      contentType: 'application/json',
      requestParams: pickNonBaseUnifiedAPIParams(req),
      ...this.options,
    });

    if (response instanceof Error) {
      return buildAPIResponseFromErrorOrThrow(response);
    }
    const body = await response.json();

    return response.ok
      ? {success: body as Badges}
      : {error: body as UnifiedCommerceAPIError};
  }
}

export const isErrorResponse = <T>(
  r: CommerceUnifiedAPIClientResponse<T>
): r is {error: UnifiedCommerceAPIError} => {
  return (r as {error: UnifiedCommerceAPIError}).error !== undefined;
};

export const isSuccessResponse = <T>(
  r: CommerceUnifiedAPIClientResponse<T>
): r is {success: T} => {
  return (r as {success: T}).success !== undefined;
};
