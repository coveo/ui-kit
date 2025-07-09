import {isNullOrUndefined} from '@coveo/bueno';
import type {EventDescription} from 'coveo.analytics';
import {getSearchApiBaseUrl} from '../../api/platform-client.js';
import type {SearchRequest} from '../../api/search/search/search-request.js';
import type {NavigatorContext} from '../../app/navigator-context-provider.js';
import type {SearchAppState} from '../../state/search-app-state.js';
import type {ConfigurationSection} from '../../state/state-sections.js';
import {fromAnalyticsStateToAnalyticsParams} from '../configuration/analytics-params.js';

type StateNeededByExecuteSearchAndFolding = ConfigurationSection &
  Partial<SearchAppState>;

export const buildSearchAndFoldingLoadCollectionRequest = (
  state: StateNeededByExecuteSearchAndFolding,
  navigatorContext: NavigatorContext,
  eventDescription?: EventDescription
): SearchRequest => {
  return {
    accessToken: state.configuration.accessToken,
    organizationId: state.configuration.organizationId,
    url:
      state.configuration.search.apiBaseUrl ??
      getSearchApiBaseUrl(
        state.configuration.organizationId,
        state.configuration.environment
      ),
    locale: state.configuration.search.locale,
    debug: state.debug,
    tab: state.configuration.analytics.originLevel2,
    referrer: navigatorContext.referrer,
    timezone: state.configuration.search.timezone,
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
    ...(state.context && {
      context: state.context.contextValues,
    }),
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
      fromAnalyticsStateToAnalyticsParams(
        state.configuration.analytics,
        navigatorContext,
        eventDescription
      )),
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
