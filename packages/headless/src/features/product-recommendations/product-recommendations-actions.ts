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
import {
  ProductRecommendation,
  ProductRecommendationDefaultFields,
} from '../../api/search/search/product-recommendation';
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

export interface SetProductRecommendationsRecommenderIdActionCreatorPayload {
  /**
   * The recommender id, used to determine the machine-learning model that should fulfill the request.
   */
  id: string;
}

export const setProductRecommendationsRecommenderId = createAction(
  'productrecommendations/setId',
  (payload: SetProductRecommendationsRecommenderIdActionCreatorPayload) =>
    validatePayload(payload, {
      id: requiredNonEmptyString,
    })
);

export interface SetProductRecommendationsSkusActionCreatorPayload {
  /**
   * The skus to retrieve recommendations for.
   */
  skus: string[];
}

export const setProductRecommendationsSkus = createAction(
  'productrecommendations/setSku',
  (payload: SetProductRecommendationsSkusActionCreatorPayload) =>
    validatePayload(payload, {
      skus: new ArrayValue({
        required: true,
        min: 1,
        each: new StringValue({emptyAllowed: false}),
      }),
    })
);

export interface SetProductRecommendationsBrandFilterActionCreatorPayload {
  /**
   * The brand to filter recommendations by.
   */
  brand: string;
}

export const setProductRecommendationsBrandFilter = createAction(
  'productrecommendations/setBrand',
  (payload: SetProductRecommendationsBrandFilterActionCreatorPayload) =>
    validatePayload(payload, {
      brand: new StringValue({required: true, emptyAllowed: true}),
    })
);

export interface SetProductRecommendationsCategoryFilterActionCreatorPayload {
  /**
   * The category to filter recommendations by.
   */
  category: string;
}

export const setProductRecommendationsCategoryFilter = createAction(
  'productrecommendations/setCategory',
  (payload: SetProductRecommendationsCategoryFilterActionCreatorPayload) =>
    validatePayload(payload, {
      category: new StringValue({required: true, emptyAllowed: true}),
    })
);

export interface SetProductRecommendationsAdditionalFieldsActionCreatorPayload {
  /**
   * The additional result fields to request.
   */
  additionalFields: string[];
}

export const setProductRecommendationsAdditionalFields = createAction(
  'productrecommendations/setAdditionalFields',
  (payload: SetProductRecommendationsAdditionalFieldsActionCreatorPayload) =>
    validatePayload(payload, {
      additionalFields: new ArrayValue({
        required: true,
        each: new StringValue({emptyAllowed: false}),
      }),
    })
);

export interface SetProductRecommendationsMaxNumberOfRecommendationsActionCreatorPayload {
  /**
   * The maximum number of recommendations to return.
   */
  number: number;
}

export const setProductRecommendationsMaxNumberOfRecommendations = createAction(
  'productrecommendations/setMaxNumberOfRecommendations',
  (
    payload: SetProductRecommendationsMaxNumberOfRecommendationsActionCreatorPayload
  ) =>
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
      recommendations: fetched.success.results.map((result) => ({
        ...mapResultToDeprecatedProductResult(result),
        ...mapResultToProductResult(result, {
          additionalFields: state.productRecommendations.additionalFields || [],
        }),
      })),
      analyticsAction: logProductRecommendations(),
      searchUid: fetched.success.searchUid,
      duration,
    };
  }
);

const mapResultToProductResult = (
  result: Result,
  {additionalFields}: {additionalFields: string[]}
): ProductRecommendation => {
  const ec_price = result.raw.ec_price as number | undefined;
  const ec_promo_price = result.raw.ec_promo_price as number | undefined;
  const ec_in_stock = result.raw.ec_in_stock as string | undefined;

  return {
    permanentid: result.raw.permanentid!,
    clickUri: result.clickUri,
    ec_name: result.raw.ec_name as string,
    ec_brand: result.raw.ec_brand as string,
    ec_category: result.raw.ec_category as string,
    ec_price,
    ec_shortdesc: result.raw.ec_shortdesc as string,
    ec_thumbnails: result.raw.ec_thumbnails as string[],
    ec_images: result.raw.ec_images as string[],
    ec_promo_price:
      ec_promo_price === undefined ||
      (ec_price !== undefined && ec_promo_price >= ec_price)
        ? undefined
        : ec_promo_price,
    ec_in_stock:
      ec_in_stock === undefined
        ? undefined
        : ec_in_stock.toLowerCase() === 'yes' ||
          ec_in_stock.toLowerCase() === 'true',
    ec_rating: result.raw.ec_rating as number,
    additionalFields: additionalFields.reduce(
      (all, field) => ({...all, [field]: result.raw[field]}),
      {}
    ),
  };
};

const mapResultToDeprecatedProductResult = (
  result: Result
): Partial<ProductRecommendation> => {
  const price = result.raw.ec_price as number | undefined;
  const promoPrice = result.raw.ec_promo_price as number | undefined;
  const inStock = result.raw.ec_in_stock as string | undefined;
  return {
    sku: result.raw.permanentid!,
    name: result.raw.ec_name as string,
    link: result.clickUri,
    brand: result.raw.ec_brand as string,
    category: result.raw.ec_category as string,
    price,
    shortDescription: result.raw.ec_shortdesc as string,
    thumbnailUrl: result.raw.ec_thumbnail as string,
    imageUrls: result.raw.ec_images as string[],
    promoPrice:
      promoPrice === undefined || (price !== undefined && promoPrice >= price)
        ? undefined
        : promoPrice,
    inStock:
      inStock === undefined ? undefined : inStock.toLowerCase() === 'yes',
    rating: result.raw.ec_rating as number,
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
    fieldsToInclude: [
      ...ProductRecommendationDefaultFields,
      ...(s.productRecommendations.additionalFields || []),
    ],
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
