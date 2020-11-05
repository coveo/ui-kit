import {createAction, createAsyncThunk} from '@reduxjs/toolkit';
import {
  AsyncThunkSearchOptions,
  isErrorResponse,
} from '../../api/search/search-api-client';

import {
  ConfigurationSection,
  SearchHubSection,
  ProductRecommendationsSection,
  ContextSection,
} from '../../state/state-sections';
import {
  makeSearchActionType,
  SearchAction,
} from '../analytics/analytics-actions';
import {validatePayloadSchema} from '../../utils/validate-payload';
import {ArrayValue, NumberValue, StringValue} from '@coveo/bueno';
import {
  configureAnalytics,
  historyStore,
  StateNeededByAnalyticsProvider,
} from '../../api/analytics/analytics';
import {ProductRecommendationsRequest} from '../../api/search/product-recommendations/product-recommendations-request';
import {ProductRecommendation} from '../../api/search/search/product';
import {Result} from '../../api/search/search/result';
import {ProductRecommendationAnalyticsProvider} from '../../api/analytics/product-recommendations-analytics';

export type StateNeededByGetProductRecommendations = ConfigurationSection &
  ProductRecommendationsSection &
  Partial<ContextSection & SearchHubSection>;

export interface GetProductRecommendationsThunkReturn {
  recommendations: ProductRecommendation[];
  analyticsAction: SearchAction;
  searchUid: string;
  duration: number;
}

export const setProductRecommendationsRecommenderId = createAction(
  'productrecommendations/setId',
  (payload: {id: string}) =>
    validatePayloadSchema(payload, {
      id: new StringValue({required: true, emptyAllowed: false}),
    })
);

export const setProductRecommendationsSkus = createAction(
  'productrecommendations/setSku',
  (payload: {skus: string[]}) =>
    validatePayloadSchema(payload, {
      skus: new ArrayValue({
        required: true,
        min: 1,
        each: new StringValue({emptyAllowed: false}),
      }),
    })
);

export const setProductRecommendationsBrandFilter = createAction(
  'productrecommendations/setBrand',
  (payload: {brand: string}) =>
    validatePayloadSchema(payload, {
      brand: new StringValue({required: true, emptyAllowed: true}),
    })
);

export const setProductRecommendationsCategoryFilter = createAction(
  'productrecommendations/setCategory',
  (payload: {category: string}) =>
    validatePayloadSchema(payload, {
      category: new StringValue({required: true, emptyAllowed: true}),
    })
);

export const setProductRecommendationsMaxNumberOfRecommendations = createAction(
  'productrecommendations/setMaxNumberOfRecommendations',
  (payload: {number: number}) =>
    validatePayloadSchema(payload, {
      number: new NumberValue({required: true, max: 50, min: 1}),
    })
);

/**
 * Logs a search event with an `actionCause` value of `recommendationInterfaceLoad`.
 */
export const logProductRecommendations = createAsyncThunk(
  'analytics/productrecommendations/load',
  async (_, {getState}) => {
    const state = getState() as StateNeededByAnalyticsProvider;
    await configureAnalytics(
      state,
      new ProductRecommendationAnalyticsProvider(state)
    ).logRecommendationInterfaceLoad();
    return makeSearchActionType();
  }
);

export const getProductRecommendations = createAsyncThunk<
  GetProductRecommendationsThunkReturn,
  void,
  AsyncThunkSearchOptions<StateNeededByGetProductRecommendations>
>(
  'productrecommendations/get',
  async (_, {getState, rejectWithValue, extra: {searchAPIClient}}) => {
    const state = getState();
    const startedAt = new Date().getTime();
    const fetched = await searchAPIClient.productRecommendations(
      buildProductRecommendationsRequest(state)
    );
    const duration = new Date().getTime() - startedAt;
    if (isErrorResponse(fetched)) {
      return rejectWithValue(fetched.error);
    }
    return {
      recommendations: fetched.success.results.map(mapResultToProductResult),
      analyticsAction: logProductRecommendations(),
      searchUid: fetched.success.searchUid,
      duration,
    };
  }
);

// TODO: Review the mappings here
const mapResultToProductResult = (result: Result): ProductRecommendation => {
  return {
    sku: (result.raw.productid || result.raw.sku) as string,
    name: (result.raw.ec_name || result.title) as string,
    thumbnailUrl: (result.raw.ec_image || result.raw.image) as string,
    link: result.clickUri,
    price: (result.raw.ec_price || result.raw.price) as number,
    promoPrice: (result.raw.ec_promo_price || result.raw.promo_price) as number,
    rating: (result.raw.ec_rating || result.raw.rating) as number,
    tags: result.raw.tags as string[],
    brand: (result.raw.ec_brand || result.raw.brand) as string,
    categories: (result.raw.ec_categories || result.raw.categories) as string[],
    inStock: (result.raw.ec_in_stock || result.raw.in_stock) as boolean,
  };
};

export const buildProductRecommendationsRequest = (
  s: StateNeededByGetProductRecommendations
): ProductRecommendationsRequest => {
  return {
    accessToken: s.configuration.accessToken,
    organizationId: s.configuration.organizationId,
    url: s.configuration.search.apiBaseUrl,
    ...(s.configuration.analytics.enabled && {
      visitorId: configureAnalytics(s).coveoAnalyticsClient.currentVisitorId,
    }),
    // TODO: Remove this workaround, see https://coveord.atlassian.net/browse/COM-696 for details.
    maximumAge: 0,
    recommendation: s.productRecommendations.id,
    numberOfResults: s.productRecommendations.maxNumberOfRecommendations,
    mlParameters: {
      ...(s.productRecommendations.skus &&
        s.productRecommendations.skus.length > 0 && {
          itemIds: s.productRecommendations.skus,
        }),
      ...(s.productRecommendations.filter.brand && {
        brandFilter: s.productRecommendations.filter.brand,
      }),
      ...(s.productRecommendations.filter.category && {
        categoryFilter: s.productRecommendations.filter.category,
      }),
    },
    actionsHistory: s.configuration.analytics.enabled
      ? historyStore.getHistory()
      : [],
    ...(s.context && {
      context: s.context.contextValues,
    }),
    ...(s.searchHub && {
      searchHub: s.searchHub,
    }),
  };
};
