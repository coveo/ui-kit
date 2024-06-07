import {createReducer} from '@reduxjs/toolkit';
import {CommerceAPIErrorStatusResponse} from '../../../api/commerce/commerce-api-error-response';
import {Product} from '../../../api/commerce/common/product';
import {RecommendationsCommerceSuccessResponse} from '../../../api/commerce/recommendations/recommendations-response';
import {
  fetchRecommendations,
  registerRecommendationsSlot,
  fetchMoreRecommendations,
  promoteChildToParent,
} from './recommendations-actions';
import {
  getRecommendationsInitialState,
  getRecommendationsSliceInitialState,
  RecommendationsSlice,
  RecommendationsState,
} from './recommendations-state';

export const recommendationsReducer = createReducer(
  getRecommendationsInitialState(),

  (builder) => {
    builder
      .addCase(registerRecommendationsSlot, (state, action) => {
        const slotId = action.payload.slotId;

        if (slotId in state) {
          return;
        }

        state[slotId] = buildRecommendationsSlice();
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
        recommendations.products = response.products.map(
          prependProductInItsOwnChildrenIfNeeded
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
        recommendations.products = recommendations.products.concat(
          response.products.map(prependProductInItsOwnChildrenIfNeeded)
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
