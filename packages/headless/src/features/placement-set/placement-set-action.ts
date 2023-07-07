import {createAsyncThunk} from '@reduxjs/toolkit';
import {getVisitorID} from '../../api/analytics/coveo-analytics-utils';
import {
  CommerceUnifiedAPIErrorResponse,
  isErrorResponse,
} from '../../api/commerce/unified-api/unified-api-client';
import {
  PreviewOptsParam,
  SeedsParam,
  VisitorParam,
} from '../../api/commerce/unified-api/unified-api-params';
import {AsyncThunkOptions} from '../../app/async-thunk-options';
import {CommercePlacementsThunkExtraArguments} from '../../app/commerce-placement-thunk-extra-arguments';
import {CommercePlacementsAppState} from '../../state/commerce-placements-state';
import {Badges, Recommendations} from './placement-set-interface';

export type GetPlacementCreatorPayload = {
  placementId: string;
  implementationId: string;
};

export type GetBadgesCreatorPayload = GetPlacementCreatorPayload & SeedsParam;
export type GetRecommendationsCreatorPayload = GetPlacementCreatorPayload &
  SeedsParam &
  Required<PreviewOptsParam>;

export interface AsyncThunkPlacementOptions
  extends AsyncThunkOptions<
    CommercePlacementsAppState,
    CommercePlacementsThunkExtraArguments
  > {
  rejectValue: CommerceUnifiedAPIErrorResponse & {placementId: string};
}

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
): Promise<Payload & VisitorParam> {
  const visitorID = await getVisitorID(state.configuration.analytics);
  return {...payload, visitor: {id: visitorID}};
}
