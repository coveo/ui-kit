import {createReducer} from '@reduxjs/toolkit';
import type {CommerceAPIErrorStatusResponse} from '../../../api/commerce/commerce-api-error-response.js';
import type {
  BaseProduct,
  ChildProduct,
  Product,
} from '../../../api/commerce/common/product.js';
import type {
  BaseResult,
  BaseSpotlightContent,
  Result,
  SpotlightContent,
} from '../../../api/commerce/common/result.js';
import {ResultType} from '../../../api/commerce/common/result.js';
import type {ListingCommerceSuccessResponse} from '../../../api/commerce/listing/response.js';
import {setError} from '../../error/error-actions.js';
import {setContext, setView} from '../context/context-actions.js';
import {
  fetchMoreProducts,
  fetchProductListing,
  promoteChildToParent,
  type QueryCommerceAPIThunkReturn,
} from './product-listing-actions.js';
import {
  getProductListingInitialState,
  type ProductListingState,
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
        handleFulfilled(state, action.payload.response);
        state.products = action.payload.response.products.map(
          (product, index) =>
            preprocessProduct(
              product,
              paginationOffset + index + 1,
              action.payload.response.responseId
            )
        );
        state.results = action.payload.response.results.map((result, index) =>
          preprocessResult(
            result,
            paginationOffset + index + 1,
            action.payload.response.responseId
          )
        );
      })
      .addCase(fetchMoreProducts.fulfilled, (state, action) => {
        if (!action.payload) {
          return;
        }
        const paginationOffset = getPaginationOffset(action.payload);
        handleFulfilled(state, action.payload.response);
        state.products = state.products.concat(
          action.payload.response.products.map((product, index) =>
            preprocessProduct(
              product,
              paginationOffset + index + 1,
              action.payload?.response.responseId
            )
          )
        );
        state.results = state.results.concat(
          action.payload.response.results.map((result, index) =>
            preprocessResult(
              result,
              paginationOffset + index + 1,
              action.payload?.response.responseId
            )
          )
        );
      })
      .addCase(fetchMoreProducts.pending, (state, action) => {
        handlePending(state, action.meta.requestId);
      })
      .addCase(promoteChildToParent, (state, action) => {
        const productsOrResults =
          state.results.length > 0 ? state.results : state.products;
        let childToPromote: ChildProduct | undefined;
        const currentParentIndex = productsOrResults.findIndex((result) => {
          if (result.resultType === ResultType.SPOTLIGHT) {
            return false;
          }
          childToPromote = result.children.find(
            (child) => child.permanentid === action.payload.child.permanentid
          );
          return !!childToPromote;
        });

        if (currentParentIndex === -1 || childToPromote === undefined) {
          return;
        }

        const currentParent = productsOrResults[currentParentIndex] as Product;
        const responseId = currentParent.responseId;
        const position = currentParent.position;
        const {children, totalNumberOfChildren} = currentParent;

        const newParent: Product = {
          ...(childToPromote as ChildProduct),
          resultType: ResultType.PRODUCT,
          children,
          totalNumberOfChildren,
          position,
          responseId,
        };

        productsOrResults.splice(currentParentIndex, 1, newParent);
      })
      .addCase(setView, () => getProductListingInitialState())
      .addCase(setContext, () => getProductListingInitialState())
      .addCase(setError, (state, action) => {
        handleError(state, action.payload);
      });
  }
);

function handleError(
  state: ProductListingState,
  error?: CommerceAPIErrorStatusResponse
) {
  state.error = error || null;
  state.isLoading = false;
}

function handleFulfilled(
  state: ProductListingState,
  response: ListingCommerceSuccessResponse
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

function preprocessResult(
  result: BaseResult,
  position: number,
  responseId?: string
): Result {
  if (result.resultType === ResultType.SPOTLIGHT) {
    return preprocessSpotlightContent(result, position, responseId);
  }
  return preprocessProduct(result, position, responseId);
}

function preprocessProduct(
  product: BaseProduct,
  position: number,
  responseId?: string
): Product {
  const isParentAlreadyInChildren = product.children.some(
    (child) => child.permanentid === product.permanentid
  );
  if (product.children.length === 0 || isParentAlreadyInChildren) {
    return {...product, position, responseId};
  }

  const {
    children,
    totalNumberOfChildren: _totalNumberOfChildren,
    ...restOfProduct
  } = product;

  return {
    ...product,
    children: [restOfProduct, ...children],
    position,
    responseId,
  };
}

function preprocessSpotlightContent(
  spotlight: BaseSpotlightContent,
  position: number,
  responseId?: string
): SpotlightContent {
  return {
    ...spotlight,
    position,
    responseId,
  };
}
