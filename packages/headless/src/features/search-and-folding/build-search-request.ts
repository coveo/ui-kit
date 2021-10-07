import {getVisitorID} from '../../api/analytics/analytics';
import {
  AdvancedSearchQueriesSection,
  ConfigurationSection,
  ContextSection,
  DebugSection,
  DictionaryFieldContextSection,
  FieldsSection,
  PipelineSection,
  QuerySection,
  SearchHubSection,
  SearchSection,
  SortSection,
  TabSection,
} from '../../state/state-sections';

export type StateNeededByExecuteSearchAndFolding = ConfigurationSection &
  Partial<
    QuerySection &
      AdvancedSearchQueriesSection &
      TabSection &
      SortSection &
      ContextSection &
      DictionaryFieldContextSection &
      FieldsSection &
      PipelineSection &
      SearchHubSection &
      DebugSection &
      SearchSection
  >;

export const buildSearchAndFoldingLoadCollectionRequest = (
  state: StateNeededByExecuteSearchAndFolding
) => {
  const cq = buildConstantQuery(state);
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
    ...(cq && {cq}),
    ...(state.advancedSearchQueries && {
      aq: state.advancedSearchQueries.aq,
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

function buildConstantQuery(state: StateNeededByExecuteSearchAndFolding) {
  const cq = state.advancedSearchQueries?.cq.trim() || '';
  const activeTab = Object.values(state.tabSet || {}).find(
    (tab) => tab.isActive
  );
  const tabExpression = activeTab?.expression.trim() || '';

  return [cq, tabExpression].filter((expression) => !!expression).join(' AND ');
}
