import {createReducer} from '@reduxjs/toolkit';
import {CommerceAPIErrorStatusResponse} from '../../../api/commerce/commerce-api-error-response.js';
import {
  Product,
  BaseProduct,
  ChildProduct,
} from '../../../api/commerce/common/product.js';
import {CommerceSuccessResponse} from '../../../api/commerce/common/response.js';
import {QueryCommerceAPIThunkReturn} from '../common/actions.js';
import {setContext, setView} from '../context/context-actions.js';
import {
  fetchMoreProducts,
  fetchProductListing,
  promoteChildToParent,
} from './product-listing-actions.js';
import {
  ProductListingState,
  getProductListingInitialState,
} from './product-listing-state.js';

export const productListingReducer = createReducer(
  getProductListingInitialState(),

  (builder) => {
    builder
      .addCase(fetchProductListing.rejected, (state, action) => {
        handleError(state, action.payload);
      })
      .addCase(fetchMoreProducts.rejected, (state, action) => {
        handleError(state, action.payload);
      })
      .addCase(fetchProductListing.fulfilled, (state, action) => {
        const paginationOffset = getPaginationOffset(action.payload);
        handleFullfilled(state, action.payload.response);
        state.products = action.payload.response.products.map(
          (product, index) =>
            preprocessProduct(product, paginationOffset + index + 1)
        );
      })
      .addCase(fetchMoreProducts.fulfilled, (state, action) => {
        if (!action.payload) {
          return;
        }
        const paginationOffset = getPaginationOffset(action.payload);
        handleFullfilled(state, action.payload.response);
        state.products = state.products.concat(
          action.payload.response.products.map((product, index) =>
            preprocessProduct(product, paginationOffset + index + 1)
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
        let childToPromote;
        const currentParentIndex = products.findIndex((product) => {
          childToPromote = product.children.find(
            (child) => child.permanentid === action.payload.child.permanentid
          );
          return !!childToPromote;
        });

        if (currentParentIndex === -1 || childToPromote === undefined) {
          return;
        }

        const position = products[currentParentIndex].position;
        const {children, totalNumberOfChildren} = products[currentParentIndex];

        const newParent: Product = {
          ...(childToPromote as ChildProduct),
          children,
          totalNumberOfChildren,
          position,
        };

        products.splice(currentParentIndex, 1, newParent);
      })
      .addCase(setView, () => getProductListingInitialState())
      .addCase(setContext, () => getProductListingInitialState());
  }
);

function handleError(
  state: ProductListingState,
  error?: CommerceAPIErrorStatusResponse
) {
  state.error = error || null;
  state.isLoading = false;
}

function handleFullfilled(
  state: ProductListingState,
  response: CommerceSuccessResponse
) {
  state.error = null;
  state.facets = response.facets;
  state.responseId = response.responseId;
  state.isLoading = false;
}

function handlePending(state: ProductListingState, requestId: string) {
  state.isLoading = true;
  state.requestId = requestId;
}

function getPaginationOffset(payload: QueryCommerceAPIThunkReturn): number {
  const pagination = payload.response.pagination;
  return pagination.page * pagination.perPage;
}

function preprocessProduct(product: BaseProduct, position: number): Product {
  const isParentAlreadyInChildren = product.children.some(
    (child) => child.permanentid === product.permanentid
  );
  if (product.children.length === 0 || isParentAlreadyInChildren) {
    return {...product, position};
  }

  const {children, totalNumberOfChildren, ...restOfProduct} = product;

  return {
    ...product,
    children: [restOfProduct, ...children],
    position,
  };
}
