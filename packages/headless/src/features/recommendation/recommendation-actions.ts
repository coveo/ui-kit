import {createAction, createAsyncThunk} from '@reduxjs/toolkit';
import {
  getVisitorID,
  historyStore,
} from '../../api/analytics/coveo-analytics-utils';
import {RecommendationRequest} from '../../api/search/recommendation/recommendation-request';
import {
  AsyncThunkSearchOptions,
  isErrorResponse,
} from '../../api/search/search-api-client';
import {Result} from '../../api/search/search/result';
import {RecommendationAppState} from '../../state/recommendation-app-state';
import {
  ConfigurationSection,
  RecommendationSection,
} from '../../state/state-sections';
import {
  validatePayload,
  requiredNonEmptyString,
} from '../../utils/validate-payload';
import {AnalyticsAsyncThunk} from '../analytics/analytics-utils';
import {fromAnalyticsStateToAnalyticsParams} from '../configuration/analytics-params';
import {logRecommendationUpdate} from './recommendation-analytics-actions';

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
  ...(s.configuration.analytics.analyticsMode === 'legacy'
    ? getLegacyContext(s)
    : getNextContext(s)),
  ...(s.dictionaryFieldContext && {
    dictionaryFieldContext: s.dictionaryFieldContext.contextValues,
  }),
  ...(s.fields && {
    fieldsToInclude: s.fields.fieldsToInclude,
  }),
  ...(s.configuration.analytics.enabled && {
    visitorId: await getVisitorID(s.configuration.analytics),
  }),
  ...(s.configuration.analytics.enabled &&
    (await fromAnalyticsStateToAnalyticsParams(s.configuration.analytics))),
  ...(s.configuration.search.authenticationProviders.length && {
    authentication: s.configuration.search.authenticationProviders.join(','),
  }),
  ...(s.pagination && {
    numberOfResults: s.pagination.numberOfResults,
  }),
});

const getLegacyContext = (state: StateNeededByGetRecommendations) =>
  state.context
    ? {
        context: state.context.contextValues,
      }
    : {};

const getNextContext = (state: StateNeededByGetRecommendations) => {
  if (!state.context) {
    return {};
  }
  const contextValues = state.context?.contextValues || {};
  const contextSettings = state.context?.contextSettings || {};
  const formattedObject: Record<string, string | string[]> = {};
  for (const [key, value] of Object.entries(contextValues).filter(
    ([key]) => contextSettings[key]?.useForML
  )) {
    formattedObject[key] = value;
  }
  return {
    context: formattedObject,
  };
};
