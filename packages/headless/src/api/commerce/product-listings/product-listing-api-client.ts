import {Logger} from 'pino';
import {PlatformClient} from '../../platform-client';
import {PreprocessRequest} from '../../preprocess-request';
import {buildAPIResponseFromErrorOrThrow} from '../../search/search-api-error-response';
import {
  buildGetProductsRequest,
  GetProductsRequest,
  GetProductsResponse,
} from './products-request';

/**
 * Initialization options for the `ProductListingAPIClient`.
 */
export interface ProductListingAPIClientOptions {
  logger: Logger;
  preprocessRequest: PreprocessRequest;
}

/**
 * Defines a Product Listing API response. It can represent an error or a successful response.
 */
export type ProductListingAPIResponse<TSuccessContent> =
  | ProductListingAPISuccessResponse<TSuccessContent>
  | ProductListingAPIErrorResponse;

/**
 * Defines a Product Listing API successful response.
 */
export interface ProductListingAPISuccessResponse<TContent> {
  success: TContent;
}

/**
 * Defines the content of a Product Listing API error response.
 */
export interface ProductListingAPIErrorStatusResponse {
  statusCode: number;
  message: string;
  type: string;
}

/**
 * Defines a Product Listing API error response.
 */
export interface ProductListingAPIErrorResponse {
  error: ProductListingAPIErrorStatusResponse;
}

/**
 * The client to use to interface with the Product Listing API.
 */
export class ProductListingAPIClient {
  constructor(private options: ProductListingAPIClientOptions) {}

  /**
   * Retrieves the product listing from the API.
   *
   * @param req - The request parameters.
   * @returns The products for the requested listing.
   */
  async getProducts(
    req: GetProductsRequest
  ): Promise<ProductListingAPIResponse<GetProductsResponse>> {
    const response = await PlatformClient.call({
      ...buildGetProductsRequest(req),
      ...this.options,
    });

    if (response instanceof Error) {
      return buildAPIResponseFromErrorOrThrow(response);
    }

    const body = await response.json();
    return response.ok
      ? {success: body as GetProductsResponse}
      : {error: body as ProductListingAPIErrorStatusResponse};
  }
}
