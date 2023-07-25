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
  ModeParam,
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

export type GetPlacementCreatorPayload = PlacementIdParam & ModeParam;

export type GetBadgesCreatorPayload = GetPlacementCreatorPayload;
export type GetRecommendationsCreatorPayload = GetPlacementCreatorPayload;

export interface AsyncThunkPlacementOptions
  extends AsyncThunkOptions<
    CommercePlacementsAppState,
    CommercePlacementsThunkExtraArguments
  > {
  rejectValue: CommerceUnifiedAPIErrorResponse & {placementId: string};
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

/**
 * The payload to send when setting SKUs context for a Placement content request.
 */
export interface SetPlacementSetSkusActionCreatorPayload {
  /**
   * The SKUs of the products in the user's cart.
   */
  cart: string[];

  /**
   * The SKUs of the products displayed in an active order checkout or confirmation view.
   */
  order: string[];

  /**
   * The SKU of the product displayed in an active product description page (PDP) view.
   */
  product: string | null;

  /**
   * The SKUs of the products displayed in an active product listing page (PLP) view.
   */
  plp: string[];

  /**
   * The SKUs of the products displayed as recommendations in an active view.
   */
  recs: string[];

  /**
   * The permanent IDs of the items displayed in an active search view.
   */
  search: string[];
}

/**
 * The payload to send when setting view context for a Placement content request.
 */
export interface SetPlacementSetViewActionCreatorPayload {
  /**
   * The subtypes of the view.
   *
   * Typically, these will be the categories of a product listing page.
   */
  subtype: string[];

  /**
   * The type of view for which the Placement content is intended.
   */
  type: PlacementViewType | null;
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

export const setLocale = createAction(
  'placements/locale/set',
  (payload: SetPlacementSetLocaleActionCreatorPayload) =>
    validatePayload(payload, {
      currency: requiredNonEmptyString,
      locale: requiredNonEmptyString,
    })
);

export const setPlacementContext = createAction(
  'placement/context/set',
  (
    payload: SetPlacementSetSkusActionCreatorPayload &
      SetPlacementSetViewActionCreatorPayload
  ) =>
    validatePayload(payload, {
      subtype: new ArrayValue({each: requiredNonEmptyString}),
      type: placementSetViewTypeValue,
      cart: placementSetSkusValue,
      order: placementSetSkusValue,
      product: new StringValue({required: false, emptyAllowed: false}),
      plp: placementSetSkusValue,
      recs: placementSetSkusValue,
      search: placementSetSkusValue,
    })
);

export const setSkus = createAction(
  'placements/skus/set',
  (payload: SetPlacementSetSkusActionCreatorPayload) =>
    validatePayload(payload, {
      cart: placementSetSkusValue,
      order: placementSetSkusValue,
      product: new StringValue({required: false, emptyAllowed: false}),
      plp: placementSetSkusValue,
      recs: placementSetSkusValue,
      search: placementSetSkusValue,
    })
);

export const setView = createAction(
  'placements/view/set',
  (payload: SetPlacementSetViewActionCreatorPayload) =>
    validatePayload(payload, {
      subtype: new ArrayValue({each: requiredNonEmptyString}),
      type: placementSetViewTypeValue,
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
    mode: payload.mode ?? 'LIVE',
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
