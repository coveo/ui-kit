import {createAction, createAsyncThunk} from '@reduxjs/toolkit';
import {getVisitorID, historyStore} from '../../api/analytics/analytics';
import {RecommendationRequest} from '../../api/search/recommendation/recommendation-request';
import {
  AsyncThunkSearchOptions,
  isErrorResponse,
} from '../../api/search/search-api-client';
import {Result} from '../../api/search/search/result';
import {
  ConfigurationSection,
  RecommendationSection,
} from '../../state/state-sections';
import {
  validatePayload,
  requiredNonEmptyString,
} from '../../utils/validate-payload';
import {logRecommendationUpdate} from './recommendation-analytics-actions';
import {SearchAction} from '../analytics/analytics-utils';
import {RecommendationAppState} from '../../state/recommendation-app-state';

export type StateNeededByGetRecommendations = ConfigurationSection &
  RecommendationSection &
  Partial<RecommendationAppState>;

export interface GetRecommendationsThunkReturn {
  recommendations: Result[];
  analyticsAction: SearchAction;
  searchUid: string;
  duration: number;
}

export interface SetRecommendationIdActionCreatorPayload {
  /**
   * The recommendation identifier.
   */
  id: string;
}

export const setRecommendationId = createAction(
  'recommendation/set',
  (payload: SetRecommendationIdActionCreatorPayload) =>
    validatePayload(payload, {
      id: requiredNonEmptyString,
    })
);

export const getRecommendations = createAsyncThunk<
  GetRecommendationsThunkReturn,
  void,
  AsyncThunkSearchOptions<StateNeededByGetRecommendations>
>(
  'recommendation/get',
  async (_, {getState, rejectWithValue, extra: {apiClient}}) => {
    const state = getState();
    const startedAt = new Date().getTime();
    const fetched = await apiClient.recommendations(
      await buildRecommendationRequest(state)
    );
    const duration = new Date().getTime() - startedAt;
    if (isErrorResponse(fetched)) {
      return rejectWithValue(fetched.error);
    }
    return {
      recommendations: fetched.success.results,
      analyticsAction: logRecommendationUpdate(),
      duration,
      searchUid: fetched.success.searchUid,
    };
  }
);

export const buildRecommendationRequest = async (
  s: StateNeededByGetRecommendations
): Promise<RecommendationRequest> => ({
  accessToken: s.configuration.accessToken,
  organizationId: s.configuration.organizationId,
  url: s.configuration.search.apiBaseUrl,
  recommendation: s.recommendation.id,
  tab: s.configuration.analytics.originLevel2,
  referrer: s.configuration.analytics.originLevel3,
  timezone: s.configuration.search.timezone,
  locale: s.configuration.search.locale,
  actionsHistory: s.configuration.analytics.enabled
    ? historyStore.getHistory()
    : [],
  ...(s.advancedSearchQueries && {
    aq: s.advancedSearchQueries.aq,
    cq: s.advancedSearchQueries.cq,
  }),
  ...(s.pipeline && {
    pipeline: s.pipeline,
  }),
  ...(s.searchHub && {
    searchHub: s.searchHub,
  }),
  ...(s.context && {
    context: s.context.contextValues,
  }),
  ...(s.dictionaryFieldContext && {
    dictionaryFieldContext: s.dictionaryFieldContext.contextValues,
  }),
  ...(s.fields && {
    fieldsToInclude: s.fields.fieldsToInclude,
  }),
  ...(s.configuration.analytics.enabled && {
    visitorId: await getVisitorID(),
  }),
});
