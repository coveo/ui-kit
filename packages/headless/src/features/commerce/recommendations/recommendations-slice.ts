import {createReducer} from '@reduxjs/toolkit';
import {CommerceAPIErrorStatusResponse} from '../../../api/commerce/commerce-api-error-response.js';
import {
  BaseProduct,
  ChildProduct,
  Product,
} from '../../../api/commerce/common/product.js';
import {RecommendationsCommerceSuccessResponse} from '../../../api/commerce/recommendations/recommendations-response.js';
import {
  fetchRecommendations,
  registerRecommendationsSlot,
  fetchMoreRecommendations,
  promoteChildToParent,
  QueryRecommendationsCommerceAPIThunkReturn,
} from './recommendations-actions.js';
import {
  getRecommendationsInitialState,
  getRecommendationsSliceInitialState,
  RecommendationsSlice,
  RecommendationsState,
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
          preprocessProduct(product, paginationOffset + index + 1)
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
            preprocessProduct(product, paginationOffset + index + 1)
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
