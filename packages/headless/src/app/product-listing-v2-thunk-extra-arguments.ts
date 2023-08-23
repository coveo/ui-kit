import {ProductListingV2APIClient} from '../api/commerce/product-listings/v2/product-listing-v2-api-client';
import {ClientThunkExtraArguments} from './thunk-extra-arguments';

export interface ProductListingV2ThunkExtraArguments
  extends ClientThunkExtraArguments<ProductListingV2APIClient> {}
