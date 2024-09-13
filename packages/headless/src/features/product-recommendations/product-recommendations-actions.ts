import {ArrayValue, NumberValue, StringValue} from '@coveo/bueno';
import {createAction, createAsyncThunk} from '@reduxjs/toolkit';
import {
  historyStore,
  getVisitorID,
} from '../../api/analytics/coveo-analytics-utils';
import {getSearchApiBaseUrl} from '../../api/platform-client';
import {ProductRecommendationsRequest} from '../../api/search/product-recommendations/product-recommendations-request';
import {
  AsyncThunkSearchOptions,
  isErrorResponse,
} from '../../api/search/search-api-client';
import {
  ProductRecommendation,
  ProductRecommendationDefaultFields,
} from '../../api/search/search/product-recommendation';
import {Result} from '../../api/search/search/result';
import {ProductRecommendationsAppState} from '../../state/product-recommendations-app-state';
import {
  ConfigurationSection,
  ProductRecommendationsSection,
} from '../../state/state-sections';
import {
  validatePayload,
  requiredNonEmptyString,
  nonEmptyString,
} from '../../utils/validate-payload';
import {LegacySearchAction} from '../analytics/analytics-utils';
import {logProductRecommendations} from './product-recommendations-analytics.actions';

interface ResultWithChildren extends Result {
  childResults: ResultWithChildren[];
  totalNumberOfChildResults: number;
}

function isResultWithChildren(result: Result): result is ResultWithChildren {
  return (
    result && 'childResults' in result && 'totalNumberOfChildResults' in result
  );
}

export type StateNeededByGetProductRecommendations = ConfigurationSection &
  ProductRecommendationsSection &
  Partial<ProductRecommendationsAppState>;

export interface GetProductRecommendationsThunkReturn {
  recommendations: ProductRecommendation[];
  analyticsAction: LegacySearchAction;
  searchUid: string;
  duration: number;
}

/**
 * Deprecated. The `product-recommendation` sub-package is deprecated. Use the `commerce` sub-package instead.
 */
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

/**
 * Deprecated. The `product-recommendation` sub-package is deprecated. Use the `commerce` sub-package instead.
 * @deprecated
 */
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
        each: nonEmptyString,
      }),
    })
);

/**
 * Deprecated. The `product-recommendation` sub-package is deprecated. Use the `commerce` sub-package instead.
 * @deprecated
 */
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

/**
 * Deprecated. The `product-recommendation` sub-package is deprecated. Use the `commerce` sub-package instead.
 * @deprecated
 */
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

/**
 * Deprecated. The `product-recommendation` sub-package is deprecated. Use the `commerce` sub-package instead.
 * @deprecated
 */
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
        each: nonEmptyString,
      }),
    })
);

/**
 * Deprecated. The `product-recommendation` sub-package is deprecated. Use the `commerce` sub-package instead.
 * @deprecated
 */
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
  'productRecommendations/get',
  async (_, {getState, rejectWithValue, extra: {apiClient}}) => {
    const state = getState();
    const startedAt = new Date().getTime();
    const fetched = await apiClient.productRecommendations(
      await buildProductRecommendationsRequest(state)
    );
    const duration = new Date().getTime() - startedAt;
    if (isErrorResponse(fetched)) {
      return rejectWithValue(fetched.error);
    }

    const additionalFields =
      state.productRecommendations.additionalFields || [];

    return {
      recommendations: fetched.success.results.map((result) =>
        mapResultToProductResult(result, {additionalFields})
      ),
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

  const recommendation: ProductRecommendation = {
    documentUri: result.uri,
    documentUriHash: result.raw.urihash,
    permanentid: result.raw.permanentid!,
    clickUri: result.clickUri,
    ec_name: result.raw.ec_name as string,
    ec_brand: result.raw.ec_brand as string,
    ec_category: result.raw.ec_category as string,
    ec_item_group_id: result.raw.ec_item_group_id as string,
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
    childResults: [],
    totalNumberOfChildResults: 0,
  };

  if (isResultWithChildren(result)) {
    recommendation.childResults = result.childResults.map((childResult) =>
      mapResultToProductResult(childResult, {additionalFields})
    );
    recommendation.totalNumberOfChildResults = result.totalNumberOfChildResults;
  }

  return recommendation;
};

export const buildProductRecommendationsRequest = async (
  s: StateNeededByGetProductRecommendations
): Promise<ProductRecommendationsRequest> => {
  return {
    accessToken: s.configuration.accessToken,
    organizationId: s.configuration.organizationId,
    url:
      s.configuration.search.apiBaseUrl ??
      getSearchApiBaseUrl(
        s.configuration.organizationId,
        s.configuration.environment
      ),
    locale: s.configuration.search.locale,
    timezone: s.configuration.search.timezone,
    ...(s.configuration.analytics.enabled && {
      visitorId: await getVisitorID(s.configuration.analytics),
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
    ...(s.dictionaryFieldContext && {
      dictionaryFieldContext: s.dictionaryFieldContext.contextValues,
    }),
    ...(s.searchHub && {
      searchHub: s.searchHub,
    }),
  };
};
