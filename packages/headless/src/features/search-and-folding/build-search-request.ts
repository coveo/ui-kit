import {getVisitorID} from '../../api/analytics/analytics';
import {
  AdvancedSearchQueriesSection,
  ConfigurationSection,
  ContextSection,
  DebugSection,
  FieldsSection,
  PipelineSection,
  QuerySection,
  SearchHubSection,
  SearchSection,
  SortSection,
} from '../../state/state-sections';

export type StateNeededByExecuteSearchAndFolding = ConfigurationSection &
  Partial<
    QuerySection &
      AdvancedSearchQueriesSection &
      SortSection &
      ContextSection &
      FieldsSection &
      PipelineSection &
      SearchHubSection &
      DebugSection &
      SearchSection
  >;

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
    ...(state.advancedSearchQueries && {
      aq: state.advancedSearchQueries.aq,
      cq: state.advancedSearchQueries.cq,
      lq: state.advancedSearchQueries.lq,
    }),
    ...(state.context && {
      context: state.context.contextValues,
    }),
    ...(state.fields && {
      fieldsToInclude: state.fields.fieldsToInclude,
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
