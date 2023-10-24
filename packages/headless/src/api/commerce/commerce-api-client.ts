import {Logger} from 'pino';
import {CommerceThunkExtraArguments} from '../../app/commerce-thunk-extra-arguments';
import {CommerceAppState} from '../../state/commerce-app-state';
import {PlatformClient} from '../platform-client';
import {PreprocessRequest} from '../preprocess-request';
import {buildAPIResponseFromErrorOrThrow} from '../search/search-api-error-response';
import {
  CommerceAPIErrorResponse,
  CommerceAPIErrorStatusResponse,
} from './commerce-api-error-response';
import {
  buildProductListingV2Request,
  ProductListingV2Request,
} from './product-listings/v2/product-listing-v2-request';
import {ProductListingV2SuccessResponse} from './product-listings/v2/product-listing-v2-response';

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
    req: ProductListingV2Request
  ): Promise<CommerceAPIResponse<ProductListingV2SuccessResponse>> {
    const response = await PlatformClient.call({
      ...buildProductListingV2Request(req),
      ...this.options,
    });

    if (response instanceof Error) {
      return buildAPIResponseFromErrorOrThrow(response);
    }

    const body = await response.json();

    return response.ok
      ? {
          success: body as ProductListingV2SuccessResponse,
        }
      : {error: body as CommerceAPIErrorStatusResponse};
  }
}
