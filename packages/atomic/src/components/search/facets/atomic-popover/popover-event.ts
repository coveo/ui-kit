import {FacetType} from '../../../common/facets/facet-common';

export interface InitializePopoverEvent {
  facetId: string;
  facetType: FacetType;
  getHasValues: () => boolean;
  getNumberOfSelectedValues: () => number;
}

export interface ClearPopoverEvent {
  ignorePopoverFacetId?: string;
}
