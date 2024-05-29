import {createReducer} from '@reduxjs/toolkit';
import {CommerceAPIErrorStatusResponse} from '../../../api/commerce/commerce-api-error-response';
import {Product} from '../../../api/commerce/common/product';
import {CommerceSuccessResponse} from '../../../api/commerce/common/response';
import {
  executeSearch,
  fetchMoreProducts,
  promoteChildToParent,
} from './search-actions';
import {
  CommerceSearchState,
  getCommerceSearchInitialState,
} from './search-state';

export const commerceSearchReducer = createReducer(
  getCommerceSearchInitialState(),

  (builder) => {
    builder
      .addCase(executeSearch.rejected, (state, action) => {
        handleError(state, action.payload);
      })
      .addCase(fetchMoreProducts.rejected, (state, action) => {
        handleError(state, action.payload);
      })
      .addCase(executeSearch.fulfilled, (state, action) => {
        handleFulfilled(
          state,
          action.payload.response,
          action.payload.queryExecuted
        );
        state.products = action.payload.response.products.map(
          prependProductInItsOwnChildrenIfNeeded
        );
      })
      .addCase(fetchMoreProducts.fulfilled, (state, action) => {
        if (!action.payload) {
          return;
        }
        handleFulfilled(
          state,
          action.payload.response,
          action.payload.queryExecuted
        );
        state.products = state.products.concat(
          action.payload.response.products.map(
            prependProductInItsOwnChildrenIfNeeded
          )
        );
      })
      .addCase(executeSearch.pending, (state, action) => {
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
  state: CommerceSearchState,
  error?: CommerceAPIErrorStatusResponse
) {
  state.error = error || null;
  state.isLoading = false;
}

function handlePending(state: CommerceSearchState, requestId: string) {
  state.isLoading = true;
  state.requestId = requestId;
}

function handleFulfilled(
  state: CommerceSearchState,
  response: CommerceSuccessResponse,
  query?: string
) {
  state.error = null;
  state.facets = response.facets;
  state.responseId = response.responseId;
  state.isLoading = false;
  state.queryExecuted = query ?? '';
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
