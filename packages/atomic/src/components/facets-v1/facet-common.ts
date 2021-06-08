import {SearchStatus, SearchStatusState} from '@coveo/headless';

export interface AtomicBaseFacet<Facet, FacetState> {
  facet: Facet;
  facetState: FacetState;
  searchStatus: SearchStatus;
  searchStatusState: SearchStatusState;
  error: Error;
  isCollapsed: Boolean;
  label: string;
  field: string;
}
