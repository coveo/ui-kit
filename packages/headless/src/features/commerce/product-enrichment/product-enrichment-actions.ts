import {createAsyncThunk} from '@reduxjs/toolkit';
import type {AsyncThunkCommerceOptions} from '../../../api/commerce/commerce-api-client.js';
import type {ProductEnrichmentBadgesRequest} from '../../../api/commerce/product-enrichment/product-enrichment-request.js';
import type {ProductEnrichmentSuccessBadgesResponse} from '../../../api/commerce/product-enrichment/product-enrichment-response.js';
import type {NavigatorContext} from '../../../app/navigator-context-provider.js';
import type {ProductEnrichmentSection} from '../../../state/state-sections.js';
import {validatePayload} from '../../../utils/validate-payload.js';
import {
  buildBaseCommerceAPIRequest,
  type StateNeededForBaseCommerceAPIRequest,
} from '../common/base-commerce-api-request-builder.js';
import {productEnrichmentDefinition} from './product-enrichment.js';

export type StateNeededByFetchBadges = StateNeededForBaseCommerceAPIRequest &
  ProductEnrichmentSection;

export interface FetchBadgesPayload {
  /**
   * An array of placement IDs to fetch badges for.
   */
  placementIds?: string[];
  /**
   * The product ID to fetch badges for.
   */
  productId?: string;
}

const buildProductEnrichmentBadgesRequest = (
  payload: FetchBadgesPayload,
  state: StateNeededByFetchBadges,
  navigatorContext: NavigatorContext
): ProductEnrichmentBadgesRequest => {
  const baseRequest = buildBaseCommerceAPIRequest(state, navigatorContext);

  return {
    ...baseRequest,
    context: {
      ...baseRequest.context,
      ...(payload.productId ? {product: {productId: payload.productId}} : {}),
    },
    placementIds: payload.placementIds,
  };
};

export interface FetchBadgesThunkReturn {
  response: ProductEnrichmentSuccessBadgesResponse;
}

export const fetchBadges = createAsyncThunk<
  FetchBadgesThunkReturn,
  FetchBadgesPayload,
  AsyncThunkCommerceOptions<StateNeededByFetchBadges>
>(
  'commerce/productEnrichment/fetchBadges',
  async (
    payload,
    {getState, rejectWithValue, extra: {apiClient, navigatorContext}}
  ) => {
    validatePayload(payload, productEnrichmentDefinition);

    const request = buildProductEnrichmentBadgesRequest(
      payload,
      getState(),
      navigatorContext
    );

    const fetched = await apiClient.getBadges(request);

    if ('error' in fetched) {
      return rejectWithValue(fetched.error);
    }

    return {
      response: fetched.success,
    };
  }
);
