import type {EventDescription} from 'coveo.analytics';
import type {SearchAppState} from '../../../state/search-app-state.js';
import type {ConfigurationSection} from '../../../state/state-sections.js';
import {getFacets} from '../../../utils/facet-utils.js';
import type {AutomaticFacetRequest} from '../../facets/automatic-facet-set/interfaces/request.js';
import type {AutomaticFacetResponse} from '../../facets/automatic-facet-set/interfaces/response.js';
import {maximumNumberOfResultsFromIndex} from '../../pagination/pagination-constants.js';
import {buildSearchAndFoldingLoadCollectionRequest} from '../../search-and-folding/legacy/search-and-folding-request.js';
import {mapSearchRequest} from '../search-mappings.js';

type StateNeededBySearchRequest = ConfigurationSection &
  Partial<SearchAppState>;

export const buildSearchRequest = async (
  state: StateNeededBySearchRequest,
  eventDescription?: EventDescription
) => {
  const cq = buildConstantQuery(state);
  const facets = getFacets(state);
  const automaticFacets = getAutomaticFacets(state);
  const sharedWithFoldingRequest =
    await buildSearchAndFoldingLoadCollectionRequest(state, eventDescription);

  // Corner case:
  // If the number of results requested would go over the index limit (maximumNumberOfResultsFromIndex)
  // we need to request fewer results in order to ensure we do not receive an exception from the index
  const getNumberOfResultsWithinIndexLimit = () => {
    if (!state.pagination) {
      return undefined;
    }

    const isOverIndexLimit =
      state.pagination.firstResult + state.pagination.numberOfResults >
      maximumNumberOfResultsFromIndex;

    if (isOverIndexLimit) {
      return maximumNumberOfResultsFromIndex - state.pagination.firstResult;
    }
    return state.pagination.numberOfResults;
  };

  return mapSearchRequest({
    ...sharedWithFoldingRequest,
    ...(state.didYouMean && {
      queryCorrection: {
        enabled:
          state.didYouMean.enableDidYouMean &&
          state.didYouMean.queryCorrectionMode === 'next',
        options: {
          automaticallyCorrect: state.didYouMean.automaticallyCorrectQuery
            ? ('whenNoResults' as const)
            : ('never' as const),
        },
      },
      enableDidYouMean:
        state.didYouMean.enableDidYouMean &&
        state.didYouMean.queryCorrectionMode === 'legacy',
    }),
    ...(cq && {cq}),
    ...(facets.length && {facets}),
    ...(state.pagination && {
      numberOfResults: getNumberOfResultsWithinIndexLimit(),
      firstResult: state.pagination.firstResult,
    }),
    ...(state.facetOptions && {
      facetOptions: {freezeFacetOrder: state.facetOptions.freezeFacetOrder},
    }),
    ...(state.folding?.enabled && {
      filterField: state.folding.fields.collection,
      childField: state.folding.fields.parent,
      parentField: state.folding.fields.child,
      filterFieldRange: state.folding.filterFieldRange,
    }),
    ...(state.automaticFacetSet && {
      generateAutomaticFacets: {
        desiredCount: state.automaticFacetSet.desiredCount,
        numberOfValues: state.automaticFacetSet.numberOfValues,
        currentFacets: automaticFacets,
      },
    }),
    ...(state.generatedAnswer && {
      pipelineRuleParameters: {
        mlGenerativeQuestionAnswering: {
          responseFormat: state.generatedAnswer.responseFormat,
          citationsFieldToInclude:
            state.generatedAnswer.fieldsToIncludeInCitations,
        },
      },
    }),
  });
};

function getAutomaticFacets(state: StateNeededBySearchRequest) {
  const facets = state.automaticFacetSet?.set;

  return facets
    ? Object.values(facets)
        .map((facet) => facet.response)
        .map(responseToAutomaticFacetRequest)
        .filter((facetRequest) => facetRequest.currentValues.length > 0)
    : undefined;
}
function responseToAutomaticFacetRequest(
  response: AutomaticFacetResponse
): AutomaticFacetRequest {
  const {field, label, values} = response;

  const selectedValues = values.filter((value) => value.state === 'selected');
  return {
    field,
    label,
    currentValues: selectedValues,
  };
}

function buildConstantQuery(state: StateNeededBySearchRequest) {
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

function getStaticFilterExpressions(state: StateNeededBySearchRequest) {
  const filters = Object.values(state.staticFilterSet || {});
  return filters.map((filter) => {
    const selected = filter.values.filter(
      (value) => value.state === 'selected' && !!value.expression.trim()
    );

    const expression = selected.map((value) => value.expression).join(' OR ');
    return selected.length > 1 ? `(${expression})` : expression;
  });
}
