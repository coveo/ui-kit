import {createReducer} from '@reduxjs/toolkit';
import type {CommerceAPIErrorStatusResponse} from '../../../api/commerce/commerce-api-error-response.js';
import type {
  BaseProduct,
  ChildProduct,
  Product,
} from '../../../api/commerce/common/product.js';
import type {CommerceSuccessResponse} from '../../../api/commerce/common/response.js';
import {ResultType} from '../../../api/commerce/common/result.js';
import {setError} from '../../error/error-actions.js';
import {setContext, setView} from '../context/context-actions.js';
import {
  executeSearch,
  fetchMoreProducts,
  promoteChildToParent,
  type QuerySearchCommerceAPIThunkReturn,
} from './search-actions.js';
import {
  type CommerceSearchState,
  getCommerceSearchInitialState,
} from './search-state.js';

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
        const paginationOffset = getPaginationOffset(action.payload);
        handleFulfilled(
          state,
          action.payload.response,
          action.payload.queryExecuted
        );
        state.products = action.payload.response.products.map(
          (product, index) =>
            preprocessProduct(
              product,
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
        handleFulfilled(
          state,
          action.payload.response,
          action.payload.queryExecuted
        );
        state.products = state.products.concat(
          action.payload.response.products.map((product, index) =>
            preprocessProduct(
              product,
              paginationOffset + index + 1,
              action.payload?.response.responseId
            )
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
        let childToPromote: ChildProduct | undefined;
        const currentParentIndex = products.findIndex((product) => {
          childToPromote = product.children.find(
            (child) => child.permanentid === action.payload.child.permanentid
          );
          return !!childToPromote;
        });

        if (currentParentIndex === -1 || childToPromote === undefined) {
          return;
        }

        const responseId = products[currentParentIndex].responseId;
        const position = products[currentParentIndex].position;
        const {children, totalNumberOfChildren} = products[currentParentIndex];

        const newParent: Product = {
          ...(childToPromote as ChildProduct),
          resultType: ResultType.PRODUCT,
          children,
          totalNumberOfChildren,
          position,
          responseId,
        };

        products.splice(currentParentIndex, 1, newParent);
      })
      .addCase(setView, () => getCommerceSearchInitialState())
      .addCase(setContext, () => getCommerceSearchInitialState())
      .addCase(setError, (state, action) => {
        state.error = action.payload;
        state.isLoading = false;
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

function getPaginationOffset(
  payload: QuerySearchCommerceAPIThunkReturn
): number {
  const pagination = payload.response.pagination;
  return pagination.page * pagination.perPage;
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
