import {ProductListingAPIClient} from '../api/commerce/product-listings/product-listing-api-client';
import {ClientThunkExtraArguments} from './thunk-extra-arguments';

export interface ProductListingThunkExtraArguments
  extends ClientThunkExtraArguments<ProductListingAPIClient> {}
