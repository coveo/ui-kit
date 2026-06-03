import {createReducer} from '@reduxjs/toolkit';
import type {CommerceAPIErrorStatusResponse} from '../../../api/commerce/commerce-api-error-response.js';
import type {
  BaseProduct,
  ChildProduct,
  Product,
} from '../../../api/commerce/common/product.js';
import {ResultType} from '../../../api/commerce/common/result.js';
import type {RecommendationsCommerceSuccessResponse} from '../../../api/commerce/recommendations/recommendations-response.js';
import {setError} from '../../error/error-actions.js';
import {
  fetchMoreRecommendations,
  fetchRecommendations,
  promoteChildToParent,
  type QueryRecommendationsCommerceAPIThunkReturn,
  registerRecommendationsSlot,
} from './recommendations-actions.js';
import {
  getRecommendationsInitialState,
  getRecommendationsSliceInitialState,
  type RecommendationsSlice,
  type RecommendationsState,
} from './recommendations-state.js';

export const recommendationsReducer = createReducer(
  getRecommendationsInitialState(),

  (builder) => {
    builder
      .addCase(registerRecommendationsSlot, (state, action) => {
        const slotId = action.payload.slotId;
        const productId = action.payload.productId;

        if (slotId in state) {
          return;
        }

        if (!productId) {
          state[slotId] = buildRecommendationsSlice();
          return;
        }

        state[slotId] = buildRecommendationsSlice({productId});
      })
      .addCase(fetchRecommendations.rejected, (state, action) => {
        handleError(state, action.meta.arg.slotId, action.payload);
      })
      .addCase(fetchMoreRecommendations.rejected, (state, action) => {
        handleError(state, action.meta.arg.slotId, action.payload);
      })
      .addCase(fetchRecommendations.fulfilled, (state, action) => {
        const slotId = action.meta.arg.slotId;
        const response = action.payload.response;

        handleFulfilled(state, slotId, response);
        const recommendations = state[slotId];

        if (!recommendations) {
          return;
        }
        const paginationOffset = getPaginationOffset(action.payload);

        recommendations.products = response.products.map((product, index) =>
          preprocessProduct(
            product,
            paginationOffset + index + 1,
            response.responseId
          )
        );
      })
      .addCase(fetchMoreRecommendations.fulfilled, (state, action) => {
        if (!action.payload) {
          return;
        }
        const slotId = action.meta.arg.slotId;
        const response = action.payload.response;

        handleFulfilled(state, slotId, response);
        const recommendations = state[slotId];

        if (!recommendations) {
          return;
        }

        const paginationOffset = getPaginationOffset(action.payload);

        recommendations.products = recommendations.products.concat(
          response.products.map((product, index) =>
            preprocessProduct(
              product,
              paginationOffset + index + 1,
              response.responseId
            )
          )
        );
      })
      .addCase(fetchRecommendations.pending, (state, action) => {
        handlePending(state, action.meta.arg.slotId);
      })
      .addCase(fetchMoreRecommendations.pending, (state, action) => {
        handlePending(state, action.meta.arg.slotId);
      })
      .addCase(promoteChildToParent, (state, action) => {
        const recommendations = state[action.payload.slotId];

        if (!recommendations) {
          return;
        }

        const {products} = recommendations;
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
      .addCase(setError, (state, action) => {
        // We do not know the slotId here, so we need to error on all slots.
        Object.keys(state).forEach((slotId) => {
          handleError(state, slotId, action.payload);
        });
      });
  }
);

function buildRecommendationsSlice(
  config?: Partial<RecommendationsSlice>
): RecommendationsSlice {
  return {
    ...getRecommendationsSliceInitialState(),
    ...config,
  };
}

function handleError(
  state: RecommendationsState,
  slotId: string,
  error?: CommerceAPIErrorStatusResponse
) {
  const recommendations = state[slotId];

  if (!recommendations) {
    return;
  }

  recommendations.error = error ?? null;
  recommendations.isLoading = false;
}

function handleFulfilled(
  state: RecommendationsState,
  slotId: string,
  response: RecommendationsCommerceSuccessResponse
) {
  const recommendations = state[slotId];

  if (!recommendations) {
    return;
  }

  recommendations.error = null;
  recommendations.headline = response.headline;
  recommendations.responseId = response.responseId;
  recommendations.isLoading = false;
}

function handlePending(state: RecommendationsState, slotId: string) {
  const recommendations = state[slotId];

  if (!recommendations) {
    return;
  }
  recommendations.isLoading = true;
}

function getPaginationOffset(
  actionPayload: QueryRecommendationsCommerceAPIThunkReturn
): number {
  const pagination = actionPayload.response.pagination;
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
