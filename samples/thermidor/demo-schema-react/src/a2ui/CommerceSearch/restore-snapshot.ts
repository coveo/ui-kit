import type {
  CategoryFacetState,
  FacetRestore,
  NumericFacetState,
  PaginationState,
  QuerySummaryState,
  RegularFacetState,
  RestoreStatePayload,
  SortState,
} from '@coveo/thermidor-schema';

/** A node of a commerce-search surface: its id and its component type. */
export interface SurfaceNode {
  id: string;
  type: string;
}

function facetRestore(type: string, state: unknown): FacetRestore | undefined {
  switch (type) {
    case 'RegularFacet': {
      const {field, values} = state as RegularFacetState;
      const selected = values.filter((value) => value.state === 'selected');
      return selected.length > 0
        ? {facetId: field, values: selected.map((value) => value.value)}
        : undefined;
    }
    case 'NumericFacet': {
      const {field, values, customRange} = state as NumericFacetState;
      const ranges = [
        ...values.filter((value) => value.state === 'selected'),
        ...(customRange ? [customRange] : []),
      ];
      return ranges.length > 0
        ? {facetId: field, numericRanges: ranges.map(({start, end}) => ({start, end}))}
        : undefined;
    }
    case 'CategoryFacet': {
      const {field, values} = state as CategoryFacetState;
      return values.selected ? {facetId: field, path: values.selected.path} : undefined;
    }
    default:
      return undefined;
  }
}

/**
 * The `restoreState` payload that brings a commerce-search surface back to its current search, or
 * `undefined` until the surface has a page to restore.
 */
export function buildRestoreSnapshot(
  nodes: Iterable<SurfaceNode>,
  stateOf: (id: string) => unknown
): RestoreStatePayload | undefined {
  let query = '';
  let pagination: PaginationState | undefined;
  let sortCriteria: string | undefined;
  const facets: FacetRestore[] = [];

  for (const {id, type} of nodes) {
    const state = stateOf(id);
    if (state === undefined) {
      continue;
    }
    switch (type) {
      case 'QuerySummary':
        query = (state as QuerySummaryState).query;
        break;
      case 'Pagination':
        pagination = state as PaginationState;
        break;
      case 'Sort':
        sortCriteria = (state as SortState).appliedSort.sortCriteria;
        break;
      default: {
        const facet = facetRestore(type, state);
        if (facet) {
          facets.push(facet);
        }
      }
    }
  }

  if (!pagination) {
    return undefined;
  }
  return {
    query,
    page: pagination.page,
    pageSize: pagination.pageSize,
    ...(sortCriteria !== undefined && {sortCriteria}),
    ...(facets.length > 0 && {facets}),
  };
}
