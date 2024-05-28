import * as ProductListingSelectors from '../features/commerce/product-listing/product-listing-selectors';
import * as SearchSelectors from '../features/commerce/search/search-selectors';

export namespace Search {
  export const responseIdSelectorFromEngine =
    SearchSelectors.responseIdSelectorFromEngine;
}

export namespace ProductListing {
  export const responseIdSelectorFromEngine =
    ProductListingSelectors.responseIdSelectorFromEngine;
}
