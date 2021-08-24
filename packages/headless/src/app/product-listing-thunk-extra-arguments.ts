import {ProductListingAPIClient} from '../api/commerce/product-listings/product-listing-api-client';
import {ThunkExtraArguments} from './thunk-extra-arguments';

export interface ProductListingThunkExtraArguments extends ThunkExtraArguments {
  productListingClient: ProductListingAPIClient;
}
