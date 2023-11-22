import {isNullOrUndefined} from '@coveo/bueno';
import {EventDescription} from 'coveo.analytics';
import {
  getVisitorID,
  historyStore,
} from '../../api/analytics/coveo-analytics-utils';
import {SearchRequest} from '../../api/search/search/search-request';
import {SearchAppState} from '../../state/search-app-state';
import {ConfigurationSection} from '../../state/state-sections';
import {fromAnalyticsStateToAnalyticsParams} from '../configuration/analytics-params';

type StateNeededByExecuteSearchAndFolding = ConfigurationSection &
  Partial<SearchAppState>;

export const buildSearchAndFoldingLoadCollectionRequest = async (
  state: StateNeededByExecuteSearchAndFolding,
  eventDescription?: EventDescription
): Promise<SearchRequest> => {
  return {
    accessToken: state.configuration.accessToken,
    organizationId: state.configuration.organizationId,
    url: state.configuration.search.apiBaseUrl,
    locale: state.configuration.search.locale,
    debug: state.debug,
    tab: state.configuration.analytics.originLevel2,
    referrer: state.configuration.analytics.originLevel3,
    timezone: state.configuration.search.timezone,
    ...(state.configuration.analytics.enabled && {
      visitorId: await getVisitorID(state.configuration.analytics),
      actionsHistory: historyStore.getHistory(),
    }),
    ...(state.advancedSearchQueries?.aq && {
      aq: state.advancedSearchQueries.aq,
    }),
    ...(state.advancedSearchQueries?.cq && {
      cq: state.advancedSearchQueries.cq,
    }),
    ...(state.advancedSearchQueries?.lq && {
      lq: state.advancedSearchQueries.lq,
    }),
    ...(state.advancedSearchQueries?.dq && {
      dq: state.advancedSearchQueries.dq,
    }),
    ...(state.configuration.analytics.analyticsMode === 'legacy'
      ? getLegacyContext(state)
      : getNextContext(state)),
    ...(state.fields &&
      !state.fields.fetchAllFields && {
        fieldsToInclude: state.fields.fieldsToInclude,
      }),
    ...(state.dictionaryFieldContext && {
      dictionaryFieldContext: state.dictionaryFieldContext.contextValues,
    }),
    ...(state.pipeline && {
      pipeline: state.pipeline,
    }),
    ...(state.query && {
      q: state.query.q,
      enableQuerySyntax: state.query.enableQuerySyntax,
    }),
    ...(state.searchHub && {
      searchHub: state.searchHub,
    }),
    ...(state.sortCriteria && {
      sortCriteria: state.sortCriteria,
    }),
    ...(state.configuration.analytics.enabled &&
      (await fromAnalyticsStateToAnalyticsParams(
        state.configuration.analytics,
        eventDescription
      ))),
    ...(state.excerptLength &&
      !isNullOrUndefined(state.excerptLength.length) && {
        excerptLength: state.excerptLength.length,
      }),
    ...(state.configuration.search.authenticationProviders.length && {
      authentication:
        state.configuration.search.authenticationProviders.join(','),
    }),
  };
};

const getLegacyContext = (state: StateNeededByExecuteSearchAndFolding) =>
  state.context
    ? {
        context: state.context.contextValues,
      }
    : {};

const getNextContext = (state: StateNeededByExecuteSearchAndFolding) => {
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
