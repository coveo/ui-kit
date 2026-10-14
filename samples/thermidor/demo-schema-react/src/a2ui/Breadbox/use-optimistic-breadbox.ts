import type {
  BreadboxAction,
  BreadboxDeselectPayload,
  BreadboxFacet,
  BreadboxProps,
} from '@coveo/thermidor-schema/zod3';
import {useOptimisticValue} from '../use-optimistic-value.js';

const NO_FACETS: BreadboxFacet[] = [];

export interface OptimisticBreadbox {
  facets: BreadboxFacet[];
  deselect: (payload: BreadboxDeselectPayload) => void;
  clearAll: () => void;
}

function withoutValue(facet: BreadboxFacet, payload: BreadboxDeselectPayload): BreadboxFacet {
  if (facet.facetId !== payload.facetId) {
    return facet;
  }
  switch (payload.type) {
    case 'regular':
      return facet.type === 'regular'
        ? {...facet, values: facet.values.filter(({value}) => value !== payload.value)}
        : facet;
    case 'numericalRange':
      return facet.type === 'numericalRange'
        ? {
            ...facet,
            values: facet.values.filter(
              ({start, end}) => start !== payload.start || end !== payload.end
            ),
          }
        : facet;
    case 'dateRange':
      return facet.type === 'dateRange'
        ? {
            ...facet,
            values: facet.values.filter(
              ({start, end}) => start !== payload.start || end !== payload.end
            ),
          }
        : facet;
    case 'hierarchical':
      return facet.type === 'hierarchical' ? {...facet, path: []} : facet;
  }
}

function isActive(facet: BreadboxFacet): boolean {
  return facet.type === 'hierarchical' ? facet.path.length > 0 : facet.values.length > 0;
}

export function useOptimisticBreadbox(
  props: BreadboxProps,
  dispatch: (action: BreadboxAction) => void
): OptimisticBreadbox {
  const {value: facets, dispatchOptimistic} = useOptimisticValue(
    props.facets ?? NO_FACETS,
    dispatch
  );

  const deselect = (payload: BreadboxDeselectPayload) => {
    dispatchOptimistic({
      action: {event: {name: 'deselect', context: payload}},
      next: (current) => current.map((facet) => withoutValue(facet, payload)).filter(isActive),
      // Removals of different values compose; a later clearAll still overrides them.
      coalesce: 'dependent',
      invalidates: ['results'],
    });
  };

  const clearAll = () => {
    dispatchOptimistic({
      action: {event: {name: 'clearAll', context: {}}},
      next: () => NO_FACETS,
      coalesce: 'absolute',
      invalidates: ['results'],
    });
  };

  return {facets, deselect, clearAll};
}
