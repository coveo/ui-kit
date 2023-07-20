import {ArrayValue, StringValue} from '@coveo/bueno';
import {createAction, createAsyncThunk} from '@reduxjs/toolkit';
import {getVisitorID} from '../../api/analytics/coveo-analytics-utils';
import {
  CommerceUnifiedAPIErrorResponse,
  isErrorResponse,
} from '../../api/commerce/unified-api/unified-api-client';
import {
  ClientIdParam,
  ImplementationIdParam,
  PlacementIdParam,
  SeedsParam,
  ViewParam,
} from '../../api/commerce/unified-api/unified-api-params';
import {AsyncThunkOptions} from '../../app/async-thunk-options';
import {CommercePlacementsThunkExtraArguments} from '../../app/commerce-placement-thunk-extra-arguments';
import {PlacementViewType} from '../../controllers/placement-recommendations/headless-placement-recommendations-options';
import {CommercePlacementsAppState} from '../../state/commerce-placements-state';
import {
  nonEmptyString,
  requiredNonEmptyString,
  validatePayload,
} from '../../utils/validate-payload';
import {Badges, Recommendations} from './placement-set-interface';

export type GetPlacementCreatorPayload = PlacementIdParam;

export type GetBadgesCreatorPayload = GetPlacementCreatorPayload;
export type GetRecommendationsCreatorPayload = GetPlacementCreatorPayload;

export interface AsyncThunkPlacementOptions
  extends AsyncThunkOptions<
    CommercePlacementsAppState,
    CommercePlacementsThunkExtraArguments
  > {
  rejectValue: CommerceUnifiedAPIErrorResponse & {placementId: string};
}

/**
 * The payload to send when setting product SKUs for a Placement content request.
 */
export interface SetPlacementSetSkusActionCreatorPayload {
  /**
   * A set of skus to use for retrieving Placement content.
   */
  skus: string[];
}

/**
 * The payload to send when setting view context for a Placement content request.
 */
export interface SetPlacementSetViewActionCreatorPayload {
  /**
   * The subtypes of the view.
   */
  subtype: string[];
  /**
   * The type of view for which the Placement content is intended.
   */
  type: PlacementViewType | null;
}

export interface SetPlacementSetLocaleActionCreatorPayload {
  /**
   * The currency used in the view (e.g., "USD").
   */
  currency: string;

  /**
   * The locale used in the view (e.g., "en-us").
   */
  locale: string;
}

const placementSetSkusValue = new ArrayValue({
  required: true,
  each: nonEmptyString,
});

const placementSetViewTypeValue = new StringValue<PlacementViewType>({
  required: true,
});

export const setImplementationId = createAction(
  'placements/implementationId/set',
  (payload: string) => validatePayload(payload, new StringValue())
);

export const setCartSkus = createAction(
  'placements/skus/cart/set',
  (payload: SetPlacementSetSkusActionCreatorPayload) =>
    validatePayload(payload, {
      skus: placementSetSkusValue,
    })
);

export const setOrderSkus = createAction(
  'placements/skus/order/set',
  (payload: SetPlacementSetSkusActionCreatorPayload) =>
    validatePayload(payload, {
      skus: placementSetSkusValue,
    })
);

export const setPlpSkus = createAction(
  'placements/skus/plp/set',
  (payload: SetPlacementSetSkusActionCreatorPayload) =>
    validatePayload(payload, {
      skus: placementSetSkusValue,
    })
);

export const setProductSku = createAction(
  'placements/skus/product/set',
  (payload: string) => validatePayload(payload, new StringValue())
);

export const setRecsSkus = createAction(
  'placements/skus/recs/set',
  (payload: SetPlacementSetSkusActionCreatorPayload) =>
    validatePayload(payload, {
      skus: placementSetSkusValue,
    })
);

export const setSearchSkus = createAction(
  'placements/skus/search/set',
  (payload: SetPlacementSetSkusActionCreatorPayload) =>
    validatePayload(payload, {
      skus: placementSetSkusValue,
    })
);

export const setView = createAction(
  'placement/view/set',
  (payload: SetPlacementSetViewActionCreatorPayload) =>
    validatePayload(payload, {
      subtype: new ArrayValue({each: requiredNonEmptyString}),
      type: placementSetViewTypeValue,
    })
);

export const setLocale = createAction(
  'placement/locale/set',
  (payload: SetPlacementSetLocaleActionCreatorPayload) =>
    validatePayload(payload, {
      currency: requiredNonEmptyString,
      locale: requiredNonEmptyString,
    })
);

export const getRecs = createAsyncThunk<
  Recommendations & {placementId: string},
  GetRecommendationsCreatorPayload,
  AsyncThunkPlacementOptions
>('placements/recs/get', async (payload, config) => {
  const state = config.getState();
  const {apiClient} = config.extra;
  const payloadAugmented = await augmentPlacementPayload(payload, state);

  const response = await apiClient.getRecs({
    ...state.configuration,
    ...payloadAugmented,
    mode: 'LIVE',
    url: state.configuration.platformUrl,
  });

  if (isErrorResponse(response)) {
    return config.rejectWithValue({
      ...response,
      placementId: payload.placementId,
    });
  } else {
    return {
      ...response.success,
      placementId: payload.placementId,
    };
  }
});

export const getBadge = createAsyncThunk<
  Badges & {placementId: string},
  GetBadgesCreatorPayload,
  AsyncThunkPlacementOptions
>('placements/badges/get', async (payload, config) => {
  const state = config.getState();
  const {apiClient} = config.extra;
  const payloadAugmented = await augmentPlacementPayload(payload, state);

  const response = await apiClient.getBadges({
    ...state.configuration,
    ...payloadAugmented,
    mode: 'LIVE',
    url: state.configuration.platformUrl,
  });

  if (isErrorResponse(response)) {
    return config.rejectWithValue({
      ...response,
      placementId: payload.placementId,
    });
  } else {
    return {
      ...response.success,
      placementId: payload.placementId,
    };
  }
});

async function augmentPlacementPayload<
  Payload extends GetPlacementCreatorPayload
>(
  payload: Payload,
  state: CommercePlacementsAppState
): Promise<
  Payload & ClientIdParam & ImplementationIdParam & SeedsParam & ViewParam
> {
  const clientId = {
    clientId: await getVisitorID(state.configuration.analytics),
  } as ClientIdParam;
  const implementationId = {
    implementationId: state.placement.implementationId,
  } as ImplementationIdParam;
  const skus = state.placement.skus;
  const seeds = {
    seeds: [
      {src: 'cart', ids: skus.cart},
      {src: 'order', ids: skus.order},
      {
        src: 'pdp',
        ids: skus.product ? [skus.product] : [],
      },
      {src: 'plp', ids: skus.plp},
      {src: 'recs', ids: skus.recs},
      {src: 'search', ids: skus.search},
    ],
  } as SeedsParam;
  const v = state.placement.view;
  const view = {
    view: {
      currency: v.currency,
      locale: v.locale,
      type: v.type,
      subtype: v.subtype,
    },
  } as ViewParam;

  return {
    ...payload,
    ...clientId,
    ...implementationId,
    ...seeds,
    ...view,
  };
}
