import {SearchAppState} from '../../state/search-app-state';
import {getVisitorID} from '../../api/analytics/analytics';
import {ConfigurationSection} from '../../state/state-sections';

type StateNeededByExecuteSearchAndFolding = ConfigurationSection &
  Partial<SearchAppState>;

export const buildSearchAndFoldingLoadCollectionRequest = (
  state: StateNeededByExecuteSearchAndFolding
) => {
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
      visitorId: getVisitorID(),
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
  };
};
