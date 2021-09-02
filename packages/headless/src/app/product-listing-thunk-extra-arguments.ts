import {ProductListingAPIClient} from '../api/commerce/product-listings/product-listing-api-client';
import {SearchThunkExtraArguments} from './search-thunk-extra-arguments';

export interface ProductListingThunkExtraArguments
  extends SearchThunkExtraArguments {
  productListingClient: ProductListingAPIClient;
}
