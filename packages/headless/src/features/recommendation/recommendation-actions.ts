import {createAction, createAsyncThunk} from '@reduxjs/toolkit';
import HistoryStore from '../../api/analytics/coveo.analytics/history-store.js';
import {getSearchApiBaseUrl} from '../../api/platform-client.js';
import type {RecommendationRequest} from '../../api/search/recommendation/recommendation-request.js';
import type {Result} from '../../api/search/search/result.js';
import {
  type AsyncThunkSearchOptions,
  isErrorResponse,
} from '../../api/search/search-api-client.js';
import type {RecommendationAppState} from '../../state/recommendation-app-state.js';
import type {
  ConfigurationSection,
  RecommendationSection,
} from '../../state/state-sections.js';
import {
  requiredNonEmptyString,
  validatePayload,
} from '../../utils/validate-payload.js';
import type {AnalyticsAsyncThunk} from '../analytics/analytics-utils.js';
import {fromAnalyticsStateToAnalyticsParams} from '../configuration/legacy-analytics-params.js';
import type {SearchAction} from '../search/search-actions.js';
import {
  logRecommendationUpdate,
  recommendationInterfaceLoad,
} from './recommendation-analytics-actions.js';

export type StateNeededByGetRecommendations = ConfigurationSection &
  RecommendationSection &
  Partial<RecommendationAppState>;

export interface GetRecommendationsThunkReturn {
  recommendations: Result[];
  analyticsAction: AnalyticsAsyncThunk;
  searchUid: string;
  duration: number;
  splitTestRun: string;
  pipeline: string;
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
    const startedAt = Date.now();
    const request = await buildRecommendationRequest(state);
    const fetched = await apiClient.recommendations(request);
    const duration = Date.now() - startedAt;
    if (isErrorResponse(fetched)) {
      return rejectWithValue(fetched.error);
    }
    return {
      recommendations: fetched.success.results,
      analyticsAction: logRecommendationUpdate(),
      duration,
      searchUid: fetched.success.searchUid,
      splitTestRun: fetched.success.splitTestRun,
      pipeline: fetched.success.pipeline,
    };
  }
);

export const buildRecommendationRequest = async (
  s: StateNeededByGetRecommendations
): Promise<RecommendationRequest> => ({
  accessToken: s.configuration.accessToken,
  organizationId: s.configuration.organizationId,
  url:
    s.configuration.search.apiBaseUrl ??
    getSearchApiBaseUrl(
      s.configuration.organizationId,
      s.configuration.environment
    ),
  recommendation: s.recommendation.id,
  tab: s.configuration.analytics.originLevel2,
  referrer: s.configuration.analytics.originLevel3,
  timezone: s.configuration.search.timezone,
  locale: s.configuration.search.locale,
  actionsHistory: s.configuration.analytics.enabled
    ? HistoryStore.getInstance().getHistory()
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
  ...(s.configuration.analytics.enabled &&
    (await buildAnalyticsSection(s, recommendationInterfaceLoad()))),
  ...(s.configuration.search.authenticationProviders.length && {
    authentication: s.configuration.search.authenticationProviders.join(','),
  }),
  ...(s.pagination && {
    numberOfResults: s.pagination.numberOfResults,
  }),
});

const buildAnalyticsSection = async (
  state: StateNeededByGetRecommendations,
  action: SearchAction
) => {
  const eventDescription =
    state.configuration.analytics.analyticsMode === 'legacy'
      ? undefined
      : {
          actionCause: action.actionCause,
          type: action.actionCause,
        };

  return await fromAnalyticsStateToAnalyticsParams(
    state.configuration.analytics,
    eventDescription
  );
};
