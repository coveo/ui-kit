import {isNullOrUndefined} from '@coveo/bueno';
import {Relay} from '@coveo/relay';
import {EventDescription} from 'coveo.analytics';
import {SearchRequest} from '../../api/search/search/search-request';
import {NavigatorContext} from '../../app/navigatorContextProvider';
import {SearchAppState} from '../../state/search-app-state';
import {ConfigurationSection} from '../../state/state-sections';
import {fromAnalyticsStateToAnalyticsParams} from '../configuration/analytics-params';

type StateNeededByExecuteSearchAndFolding = ConfigurationSection &
  Partial<SearchAppState>;

export const buildSearchAndFoldingLoadCollectionRequest = async (
  state: StateNeededByExecuteSearchAndFolding,
  navigatorContext: NavigatorContext,
  relay: Relay,
  eventDescription?: EventDescription
): Promise<SearchRequest> => {
  return {
    accessToken: state.configuration.accessToken,
    organizationId: state.configuration.organizationId,
    url: state.configuration.search.apiBaseUrl,
    locale: state.configuration.search.locale,
    debug: state.debug,
    tab: state.configuration.analytics.originLevel2,
    referrer: navigatorContext.referrer,
    timezone: state.configuration.search.timezone,
    ...(state.configuration.analytics.enabled && {
      visitorId: relay.getMeta('').clientId,
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
      (await fromAnalyticsStateToAnalyticsParams(
        state.configuration.analytics,
        navigatorContext,
        relay,
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
