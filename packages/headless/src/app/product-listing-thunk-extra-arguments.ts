import {ProductListingAPIClient} from '../api/commerce/product-listings/product-listing-api-client.js';
import {ClientThunkExtraArguments} from './thunk-extra-arguments.js';

export interface ProductListingThunkExtraArguments
  extends ClientThunkExtraArguments<ProductListingAPIClient> {}
