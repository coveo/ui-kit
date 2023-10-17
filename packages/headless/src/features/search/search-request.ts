import {EventDescription} from 'coveo.analytics';
import {SearchAppState, SpecificSortCriteriaExplicit} from '../..';
import {ConfigurationSection} from '../../state/state-sections';
import {sortFacets} from '../../utils/facet-utils';
import {AutomaticFacetRequest} from '../facets/automatic-facet-set/interfaces/request';
import {AutomaticFacetResponse} from '../facets/automatic-facet-set/interfaces/response';
import {getFacetRequests} from '../facets/generic/interfaces/generic-facet-request';
import {AnyFacetValue} from '../facets/generic/interfaces/generic-facet-response';
import {RangeFacetSetState} from '../facets/range-facets/generic/interfaces/range-facet';
import {maximumNumberOfResultsFromIndex} from '../pagination/pagination-constants';
import {buildSearchAndFoldingLoadCollectionRequest} from '../search-and-folding/search-and-folding-request';
import {mapSearchRequest} from './search-mappings';
import {FacetSetState} from '../facets/facet-set/facet-set-state';

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
      enableDidYouMean: state.didYouMean.enableDidYouMean,
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
    let newSortCriteria = request.sortCriteria;
    if (
      request.sortCriteria === 'alphanumericDescending' ||
      (request.sortCriteria as SpecificSortCriteriaExplicit)?.type ===
        'alphanumericDescending'
    ) {
      newSortCriteria = {
        type: 'alphanumeric',
        order: 'descending',
      };
    } else if (
      typeof request.sortCriteria === 'object' &&
      request.sortCriteria.type !== 'automatic' &&
      request.sortCriteria.type !== 'alphanumericDescending'
    ) {
      newSortCriteria = request.sortCriteria.type;
    }

    return {
      ...request,
      sortCriteria: newSortCriteria,
    };
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
