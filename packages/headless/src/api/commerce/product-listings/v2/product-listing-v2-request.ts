import {AnyFacetResponse} from '../../../../features/facets/generic/interfaces/generic-facet-response';
import {SortCriterion} from '../../../../features/sort/sort';
import {ProductRecommendation} from '../../../search/search/product-recommendation';
import {
  baseProductListingV2Request,
  ProductListingV2RequestParam,
} from './product-listing-v2-params';

export type ProductListingV2Request = ProductListingV2RequestParam;

export const buildProductListingV2Request = (req: ProductListingV2Request) => {
  const queryStringArguments: Record<string, string> = {};

  return {
    ...baseProductListingV2Request(
      req,
      'POST',
      'application/json',
      queryStringArguments
    ),
    requestParams: prepareRequestParams(req),
  };
};

const prepareRequestParams = (req: ProductListingV2Request) => {
  const {accessToken, platformUrl, organizationId, ...params} = req;
  return params;
};

export interface ProductListingV2SuccessResponse {
  listingId: string;
  locale: string;
  responseId: string;
  products: ProductRecommendation[];
  facets: AnyFacetResponse[];
  pagination: {
    page: number;
    perPage: number;
    totalCount: number;
    totalPages: number;
  };
  sort: {
    appliedSort: SortCriterion;
    availableSorts: SortCriterion[];
  };
}
