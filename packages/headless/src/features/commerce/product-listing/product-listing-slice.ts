import {createReducer} from '@reduxjs/toolkit';
import {CommerceAPIErrorStatusResponse} from '../../../api/commerce/commerce-api-error-response';
import {Product} from '../../../api/commerce/common/product';
import {CommerceSuccessResponse} from '../../../api/commerce/common/response';
import {
  fetchMoreProducts,
  fetchProductListing,
  promoteChildToParent,
} from './product-listing-actions';
import {
  ProductListingV2State,
  getProductListingV2InitialState,
} from './product-listing-state';

export const productListingV2Reducer = createReducer(
  getProductListingV2InitialState(),

  (builder) => {
    builder
      .addCase(fetchProductListing.rejected, (state, action) => {
        handleError(state, action.payload);
      })
      .addCase(fetchMoreProducts.rejected, (state, action) => {
        handleError(state, action.payload);
      })
      .addCase(fetchProductListing.fulfilled, (state, action) => {
        handleFullfilled(state, action.payload.response);
        state.products = action.payload.response.products.map(
          prependProductInItsOwnChildrenIfNeeded
        );
      })
      .addCase(fetchMoreProducts.fulfilled, (state, action) => {
        if (!action.payload) {
          return;
        }
        handleFullfilled(state, action.payload.response);
        state.products = state.products.concat(
          action.payload.response.products.map(
            prependProductInItsOwnChildrenIfNeeded
          )
        );
      })
      .addCase(fetchProductListing.pending, (state, action) => {
        handlePending(state, action.meta.requestId);
      })
      .addCase(fetchMoreProducts.pending, (state, action) => {
        handlePending(state, action.meta.requestId);
      })
      .addCase(promoteChildToParent, (state, action) => {
        const {products} = state;
        const currentParentIndex = products.findIndex(
          (product) => product.permanentid === action.payload.parentPermanentId
        );

        if (currentParentIndex === -1) {
          return;
        }

        const {children, totalNumberOfChildren} = products[currentParentIndex];

        const childToPromote = children.find(
          (child) => child.permanentid === action.payload.childPermanentId
        );

        if (childToPromote === undefined) {
          return;
        }

        const newParent: Product = {
          ...childToPromote,
          children,
          totalNumberOfChildren,
        };

        products.splice(currentParentIndex, 1, newParent);
      });
  }
);

function handleError(
  state: ProductListingV2State,
  error?: CommerceAPIErrorStatusResponse
) {
  state.error = error || null;
  state.isLoading = false;
}

function handleFullfilled(
  state: ProductListingV2State,
  response: CommerceSuccessResponse
) {
  state.error = null;
  state.facets = response.facets;
  state.responseId = response.responseId;
  state.isLoading = false;
}

function handlePending(state: ProductListingV2State, requestId: string) {
  state.isLoading = true;
  state.requestId = requestId;
}

function prependProductInItsOwnChildrenIfNeeded(product: Product) {
  const isParentAlreadyInChildren = product.children.some(
    (child) => child.permanentid === product.permanentid
  );
  if (product.children.length === 0 || isParentAlreadyInChildren) {
    return product;
  }

  const {children, totalNumberOfChildren, ...restOfProduct} = product;

  return {
    ...product,
    children: [restOfProduct, ...children],
  };
}
