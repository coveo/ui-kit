import {Logger} from 'pino';
import {ProductListingV2ThunkExtraArguments} from '../../../../app/product-listing-v2-thunk-extra-arguments';
import {ProductListingV2AppState} from '../../../../state/commerce-app-state';
import {PlatformClient} from '../../../platform-client';
import {PreprocessRequest} from '../../../preprocess-request';
import {buildAPIResponseFromErrorOrThrow} from '../../../search/search-api-error-response';
import {
  buildProductListingV2Request,
  ProductListingV2Request as ProductListingRequest,
  ProductListingV2SuccessResponse as ProductListingSuccessResponse,
} from './product-listing-v2-request';

export interface AsyncThunkProductListingV2Options<
  T extends Partial<ProductListingV2AppState>
> {
  state: T;
  rejectValue: ProductListingAPIErrorStatusResponse;
  extra: ProductListingV2ThunkExtraArguments;
}

/**
 * The initialization options for the product listing API client.
 */
export interface ProductListingAPIClientOptions {
  logger: Logger;
  preprocessRequest: PreprocessRequest;
}

/**
 * A product listing API response.
 */
export type ProductListingAPIResponse<TSuccessContent> =
  | ProductListingAPISuccessResponse<TSuccessContent>
  | ProductListingAPIErrorResponse;

/**
 * A product listing API successful response.
 */
export interface ProductListingAPISuccessResponse<TContent> {
  success: TContent;
}

/**
 * The content of a product listing API error response.
 */
export interface ProductListingAPIErrorStatusResponse {
  statusCode: number;
  message: string;
  type: string;
  ignored?: boolean;
}

/**
 * A Product Listing API error response.
 */
export interface ProductListingAPIErrorResponse {
  error: ProductListingAPIErrorStatusResponse;
}

/**
 * The client to use to interface with the product listing API.
 */
export class ProductListingAPIClient {
  constructor(private options: ProductListingAPIClientOptions) {}

  async getListing(
    req: ProductListingRequest
  ): Promise<ProductListingAPIResponse<ProductListingSuccessResponse>> {
    const response = await PlatformClient.call({
      ...buildProductListingV2Request(req),
      ...this.options,
    });

    if (response instanceof Error) {
      return buildAPIResponseFromErrorOrThrow(response);
    }

    const body = await response.json();
    return response.ok
      ? {success: body as ProductListingSuccessResponse}
      : {error: body as ProductListingAPIErrorStatusResponse};
  }
}
