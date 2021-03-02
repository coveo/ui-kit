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
  validatePayload,
  requiredNonEmptyString,
} from '../../utils/validate-payload';
import {ArrayValue, NumberValue, StringValue} from '@coveo/bueno';
import {getVisitorID, historyStore} from '../../api/analytics/analytics';
import {ProductRecommendationsRequest} from '../../api/search/product-recommendations/product-recommendations-request';
import {ProductRecommendation} from '../../api/search/search/product';
import {Result} from '../../api/search/search/result';
import {logProductRecommendations} from './product-recommendations-analytics.actions';
import {SearchAction} from '../analytics/analytics-utils';

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
    validatePayload(payload, {
      id: requiredNonEmptyString,
    })
);

export const setProductRecommendationsSkus = createAction(
  'productrecommendations/setSku',
  (payload: {skus: string[]}) =>
    validatePayload(payload, {
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
    validatePayload(payload, {
      brand: new StringValue({required: true, emptyAllowed: true}),
    })
);

export const setProductRecommendationsCategoryFilter = createAction(
  'productrecommendations/setCategory',
  (payload: {category: string}) =>
    validatePayload(payload, {
      category: new StringValue({required: true, emptyAllowed: true}),
    })
);

export const setProductRecommendationsMaxNumberOfRecommendations = createAction(
  'productrecommendations/setMaxNumberOfRecommendations',
  (payload: {number: number}) =>
    validatePayload(payload, {
      number: new NumberValue({required: true, max: 50, min: 1}),
    })
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

const mapResultToProductResult = (result: Result): ProductRecommendation => {
  const price = (result.raw.ec_price || result.raw.price) as number | undefined;
  const promoPrice = (result.raw.ec_promo_price || result.raw.promo_price) as
    | number
    | undefined;
  const inStock = (result.raw.ec_in_stock || result.raw.in_stock) as
    | string
    | undefined;

  return {
    sku: (result.raw.productid || result.raw.sku) as string,
    name: (result.raw.ec_name as string) || result.title,
    description: (result.raw.ec_description as string) || result.excerpt,
    link: result.clickUri,
    brand: (result.raw.ec_brand || result.raw.brand) as string,
    category: result.raw.ec_category as string,
    price,
    shortDescription: result.raw.ec_shortdesc as string,
    thumbnailUrl: (result.raw.ec_thumbnail ||
      result.raw.ec_image ||
      result.raw.image ||
      (result.raw.ec_images &&
        (result.raw.ec_images as string[])[0])) as string,
    imageUrls: result.raw.ec_images as string[],
    promoPrice:
      promoPrice === undefined || (price !== undefined && promoPrice >= price)
        ? undefined
        : promoPrice,
    inStock:
      inStock === undefined ? undefined : inStock.toLowerCase() === 'yes',
    rating: (result.raw.ec_rating || result.raw.rating) as number,
    tags: result.raw.tags as string[],
  };
};

export const buildProductRecommendationsRequest = (
  s: StateNeededByGetProductRecommendations
): ProductRecommendationsRequest => {
  return {
    accessToken: s.configuration.accessToken,
    organizationId: s.configuration.organizationId,
    url: s.configuration.search.apiBaseUrl,
    locale: s.configuration.search.locale,
    ...(s.configuration.analytics.enabled && {
      visitorId: getVisitorID(),
    }),
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
