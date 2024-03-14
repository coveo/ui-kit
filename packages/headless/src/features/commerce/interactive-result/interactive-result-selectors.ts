import {Ec, Product} from '@coveo/relay-event-types';
import {createSelector} from '@reduxjs/toolkit';
import {ProductRecommendation} from '../../../api/search/search/product-recommendation';
import {CommerceEngineState} from '../../../app/commerce-engine/commerce-engine';
import {getCurrency} from '../context/context-selector';
import {ProductListingV2State} from '../product-listing/product-listing-state';
import {CommerceSearchState} from '../search/search-state';

export const getECProductClickPayload = (
  product: ProductRecommendation,
  state: CommerceEngineState
): Ec.ProductClick => ({
  product: formatProduct(product),
  responseId: getResponseId({...state.productListing, ...state.commerceSearch}),
  currency: getCurrency(state.commerceContext),
  position: getPosition(product, state),
});

const formatProduct = (product: ProductRecommendation): Product => ({
  productId: product.permanentid,
  name: product.ec_name ?? '',
  price: product.ec_price ?? 0,
});

const getPosition = (
  product: ProductRecommendation,
  state: CommerceEngineState
) => {
  const listingProducts = getListingProducts(state.productListing);
  const searchProducts = getSearchProducts(state.commerceSearch);
  const selectedProducts = listingProducts.some(
    (lProduct) => lProduct.permanentid === product.permanentid
  )
    ? listingProducts
    : searchProducts;

  return (
    selectedProducts.findIndex((p) => p.permanentid === product.permanentid) + 1
  );
};

const getResponseId = createSelector(
  (productListingState: ProductListingV2State) =>
    productListingState.responseId,
  (searchState: CommerceSearchState) => searchState.responseId,
  (listingResponseId, searchResponseId) =>
    listingResponseId ? listingResponseId : searchResponseId
);

const getListingProducts = createSelector(
  (productListingState: ProductListingV2State) => productListingState.products,
  (listingProducts) => listingProducts
);

const getSearchProducts = createSelector(
  (searchState: CommerceSearchState) => searchState.products,
  (searchProducts) => searchProducts
);
