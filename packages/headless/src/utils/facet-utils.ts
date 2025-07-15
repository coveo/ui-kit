import type {FacetSetState} from '../features/facets/facet-set/facet-set-state.js';
import {getFacetRequests} from '../features/facets/generic/interfaces/generic-facet-request.js';
import type {AnyFacetValue} from '../features/facets/generic/interfaces/generic-facet-response.js';
import type {RangeFacetSetState} from '../features/facets/range-facets/generic/interfaces/range-facet.js';
import type {SearchAppState} from '../state/search-app-state.js';
import type {ConfigurationSection} from '../state/state-sections.js';

type StateNeededBySearchRequest = ConfigurationSection &
  Partial<SearchAppState>;

type SortCriteria = {
  type: string;
  order: string;
};

export function sortFacets<T extends {facetId: string}>(
  facets: T[],
  sortOrder: string[]
) {
  const payloadMap: Record<string, T> = {};
  facets.forEach((f) => {
    payloadMap[f.facetId] = f;
  });

  const sortedFacets: T[] = [];
  sortOrder.forEach((facetId) => {
    if (facetId in payloadMap) {
      sortedFacets.push(payloadMap[facetId]);
      delete payloadMap[facetId];
    }
  });
  const remainingFacets = Object.values(payloadMap);

  return [...sortedFacets, ...remainingFacets];
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

export const sortCriteriaMap: Record<string, SortCriteria> = {
  alphanumericDescending: {type: 'alphanumeric', order: 'descending'},
  alphanumericNaturalDescending: {
    type: 'alphanumericNatural',
    order: 'descending',
  },
};

function getSpecificFacetRequests<T extends FacetSetState>(state: T) {
  return getFacetRequests(state).map((request) => {
    /* The Search API does not support 'alphanumericDescending' as a string value and instead relies on a new sort mechanism to specify sort order.
    At the moment, this is only supported for alphanumeric sorting, but will likely transition to this pattern for other types in the future. */
    const sortCriteria =
      sortCriteriaMap[request.sortCriteria as keyof typeof sortCriteriaMap];
    if (sortCriteria) {
      return {
        ...request,
        sortCriteria,
      };
    }
    return request;
  });
}

function getAllFacets(state: StateNeededBySearchRequest) {
  return [
    ...getSpecificFacetRequests(state.facetSet ?? {}),
    ...getRangeFacetRequests(state.numericFacetSet ?? {}),
    ...getRangeFacetRequests(state.dateFacetSet ?? {}),
    ...getFacetRequests(state.categoryFacetSet ?? {}),
  ];
}

function getAllEnabledFacets(state: StateNeededBySearchRequest) {
  return getAllFacets(state).filter(
    ({facetId}) => state.facetOptions?.facets[facetId]?.enabled ?? true
  );
}

export function getFacets(state: StateNeededBySearchRequest) {
  return sortFacets(getAllEnabledFacets(state), state.facetOrder ?? []);
}
