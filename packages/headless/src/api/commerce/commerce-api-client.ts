import {Logger} from 'pino';
import {CommerceThunkExtraArguments} from '../../app/commerce-thunk-extra-arguments';
import {CommerceAppState} from '../../state/commerce-app-state';
import {PlatformClient, PlatformClientCallOptions} from '../platform-client';
import {PreprocessRequest} from '../preprocess-request';
import {buildAPIResponseFromErrorOrThrow} from '../search/search-api-error-response';
import {
  CommerceAPIErrorResponse,
  CommerceAPIErrorStatusResponse,
} from './commerce-api-error-response';
import {buildRequest, CommerceAPIRequest} from './common/request';
import {CommerceSuccessResponse} from './common/response';
import {CommerceSearchRequest} from './search/request';

export interface AsyncThunkCommerceOptions<
  T extends Partial<CommerceAppState>,
> {
  state: T;
  rejectValue: CommerceAPIErrorStatusResponse;
  extra: CommerceThunkExtraArguments;
}

export interface CommerceAPIClientOptions {
  logger: Logger;
  preprocessRequest: PreprocessRequest;
}

export type CommerceAPIResponse<T> =
  | CommerceAPISuccessResponse<T>
  | CommerceAPIErrorResponse;

export interface CommerceAPISuccessResponse<T> {
  success: T;
}

export class CommerceAPIClient {
  constructor(private options: CommerceAPIClientOptions) {}

  async getProductListing(
    req: CommerceAPIRequest
  ): Promise<CommerceAPIResponse<CommerceSuccessResponse>> {
    return this.query({
      ...buildRequest(req, 'listing'),
      ...this.options,
    });
  }

  async search(
    req: CommerceSearchRequest
  ): Promise<CommerceAPIResponse<CommerceSuccessResponse>> {
    const requestOptions = buildRequest(req, 'search');
    return this.query({
      ...requestOptions,
      requestParams: {
        ...requestOptions.requestParams,
        query: req?.query,
      },
      ...this.options,
    });
  }

  private async query(options: PlatformClientCallOptions) {
    const response = await PlatformClient.call(options);

    if (response instanceof Error) {
      return buildAPIResponseFromErrorOrThrow(response);
    }

    const body = await response.json();
    return response.ok
      ? {success: body as CommerceSuccessResponse}
      : {error: body as CommerceAPIErrorStatusResponse};
  }
}
