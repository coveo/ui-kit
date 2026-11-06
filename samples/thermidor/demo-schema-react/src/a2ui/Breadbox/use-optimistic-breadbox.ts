import {useOptimistic} from 'react';
import type {
  BreadboxAction,
  BreadboxDeselectPayload,
  BreadboxFacet,
  BreadboxProps,
} from '@coveo/thermidor-schema/zod3';
import {useGesture} from '../session-request.js';

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
  dispatch: (action: BreadboxAction) => void | Promise<void>
): OptimisticBreadbox {
  const [facets, addOptimisticFacets] = useOptimistic(props.facets ?? NO_FACETS);
  const startGesture = useGesture();

  const deselect = (payload: BreadboxDeselectPayload) => {
    startGesture(
      () =>
        addOptimisticFacets(facets.map((facet) => withoutValue(facet, payload)).filter(isActive)),
      () => dispatch({event: {name: 'deselect', context: payload}})
    );
  };

  const clearAll = () => {
    startGesture(
      () => addOptimisticFacets(NO_FACETS),
      () => dispatch({event: {name: 'clearAll', context: {}}})
    );
  };

  return {facets, deselect, clearAll};
}
