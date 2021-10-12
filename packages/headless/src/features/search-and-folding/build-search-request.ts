import {SearchAppState} from '../../state/search-app-state';
import {getVisitorID} from '../../api/analytics/analytics';
import {ConfigurationSection} from '../../state/state-sections';

type StateNeededByExecuteSearchAndFolding = ConfigurationSection &
  Partial<SearchAppState>;

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
  const filterExpressions = getStaticFilterExpressions(state);

  return [cq, tabExpression, ...filterExpressions]
    .filter((expression) => !!expression)
    .join(' AND ');
}

function getStaticFilterExpressions(
  state: StateNeededByExecuteSearchAndFolding
) {
  const filters = Object.values(state.staticFilterSet || {});
  return filters.map((filter) => {
    const selected = filter.values.filter(
      (value) => value.state === 'selected' && !!value.expression.trim()
    );

    const expression = selected.map((value) => value.expression).join(' OR ');
    return selected.length > 1 ? `(${expression})` : expression;
  });
}
