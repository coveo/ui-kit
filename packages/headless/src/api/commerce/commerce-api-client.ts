import {Logger} from 'pino';
import {CommerceThunkExtraArguments} from '../../app/commerce-thunk-extra-arguments';
import {CategoryFacetResponse} from '../../features/facets/category-facet-set/interfaces/response';
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

    // TODO: stop augmenting the response body once the PLP v2 API actually starts returning category facets.
    return response.ok
      ? {
          success: this.augmentResponseBodyWithStaticCategoryFacets(
            body as ProductListingV2SuccessResponse
          ),
        }
      : {error: body as CommerceAPIErrorStatusResponse};
  }

  private augmentResponseBodyWithStaticCategoryFacets(
    body: ProductListingV2SuccessResponse
  ): ProductListingV2SuccessResponse {
    const bodyCopy = structuredClone(body);
    bodyCopy.facets = [
      {
        facetId: 'ec_category',
        field: 'ec_category',
        indexScore: 0,
        moreValuesAvailable: false,
        values: [
          {
            isLeafValue: false,
            moreValuesAvailable: true,
            numberOfResults: 35,
            path: ['Categories'],
            state: 'idle',
            value: 'Categories',
            children: [
              {
                value: 'Clothing',
                isLeafValue: false,
                moreValuesAvailable: false,
                numberOfResults: 15,
                path: ['Categories', 'Clothing'],
                state: 'idle',
                children: [
                  {
                    value: 'Pants',
                    isLeafValue: true,
                    moreValuesAvailable: false,
                    numberOfResults: 5,
                    path: ['Categories', 'Clothing', 'Pants'],
                    state: 'selected',
                    children: [],
                  },
                  {
                    value: 'Rashguard',
                    isLeafValue: true,
                    moreValuesAvailable: false,
                    numberOfResults: 5,
                    path: ['Categories', 'Clothing', 'Rashguard'],
                    state: 'idle',
                    children: [],
                  },
                  {
                    value: 'Shorts',
                    isLeafValue: true,
                    moreValuesAvailable: false,
                    numberOfResults: 5,
                    path: ['Categories', 'Clothing', 'Shorts'],
                    state: 'idle',
                    children: [],
                  },
                ],
              },
              {
                value: 'Accessories',
                isLeafValue: false,
                moreValuesAvailable: false,
                numberOfResults: 20,
                path: ['Categories', 'Accessories'],
                state: 'idle',
                children: [
                  {
                    value: 'Bags',
                    isLeafValue: false,
                    moreValuesAvailable: false,
                    numberOfResults: 10,
                    path: ['Categories', 'Clothing', 'Bags'],
                    state: 'idle',
                    children: [
                      {
                        value: 'Drybags',
                        isLeafValue: true,
                        moreValuesAvailable: false,
                        numberOfResults: 5,
                        path: ['Categories', 'Accessories', 'Bags', 'Drybags'],
                        state: 'idle',
                        children: [],
                      },
                      {
                        value: 'Surfboards',
                        isLeafValue: true,
                        moreValuesAvailable: false,
                        numberOfResults: 5,
                        path: [
                          'Categories',
                          'Accessories',
                          'Bags',
                          'Surfboards',
                        ],
                        state: 'idle',
                        children: [],
                      },
                    ],
                  },
                  {
                    value: 'Helmets',
                    isLeafValue: true,
                    moreValuesAvailable: false,
                    numberOfResults: 5,
                    path: ['Categories', 'Accessories', 'Helmets'],
                    state: 'idle',
                    children: [],
                  },
                  {
                    value: 'Inflaters',
                    isLeafValue: true,
                    moreValuesAvailable: false,
                    numberOfResults: 5,
                    path: ['Categories', 'Accessories', 'Inflaters'],
                    state: 'idle',
                    children: [],
                  },
                ],
              },
            ],
          },
        ],
      },
    ] as CategoryFacetResponse[];

    return bodyCopy;
  }
}
