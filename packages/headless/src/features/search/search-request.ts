import {EventDescription} from 'coveo.analytics';
import {SearchAppState} from '../../state/search-app-state';
import {ConfigurationSection} from '../../state/state-sections';
import {sortFacets} from '../../utils/facet-utils';
import {AutomaticFacetRequest} from '../facets/automatic-facet-set/interfaces/request';
import {AutomaticFacetResponse} from '../facets/automatic-facet-set/interfaces/response';
import {FacetSetState} from '../facets/facet-set/facet-set-state';
import {getFacetRequests} from '../facets/generic/interfaces/generic-facet-request';
import {AnyFacetValue} from '../facets/generic/interfaces/generic-facet-response';
import {RangeFacetSetState} from '../facets/range-facets/generic/interfaces/range-facet';
import {maximumNumberOfResultsFromIndex} from '../pagination/pagination-constants';
import {buildSearchAndFoldingLoadCollectionRequest} from '../search-and-folding/search-and-folding-request';
import {mapSearchRequest} from './search-mappings';

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

function getFacets(state: StateNeededBySearchRequest) {
  return sortFacets(getAllEnabledFacets(state), state.facetOrder ?? []);
}

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
function getAllEnabledFacets(state: StateNeededBySearchRequest) {
  return getAllFacets(state).filter(
    ({facetId}) => state.facetOptions?.facets[facetId]?.enabled ?? true
  );
}

function getAllFacets(state: StateNeededBySearchRequest) {
  return [
    ...getSpecificFacetRequests(state.facetSet ?? {}),
    ...getRangeFacetRequests(state.numericFacetSet ?? {}),
    ...getRangeFacetRequests(state.dateFacetSet ?? {}),
    ...getFacetRequests(state.categoryFacetSet ?? {}),
  ];
}

function getSpecificFacetRequests<T extends FacetSetState>(state: T) {
  return getFacetRequests(state).map((request) => {
    /* The Search API does not support 'alphanumericDescending' as a string value and instead relies on a new sort mechanism to specify sort order.
    At the moment, this is only supported for alphanumeric sorting, but will likely transition to this pattern for other types in the future. */
    if (request.sortCriteria === 'alphanumericDescending') {
      return {
        ...request,
        sortCriteria: {
          type: 'alphanumeric',
          order: 'descending',
        },
      };
    }

    return request;
  });
}

function getRangeFacetRequests<T extends RangeFacetSetState>(state: T) {
  return getFacetRequests(state).map((request) => {
    const currentValues = request.currentValues as AnyFacetValue[];
    const hasActiveValues = currentValues.some(({state}) => state !== 'idle');

    if (request.generateAutomaticRanges && !hasActiveValues) {
      return {...request, currentValues: []};
    }

    return request;
  });
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
