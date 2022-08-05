import {FacetType} from '../../../common/facets/facet-common';

export interface InitPopoverEventPayload {
  facetId: string;
  facetType: FacetType;
  getHasValues: () => boolean;
  getNumberOfSelectedValues: () => number;
}

export interface ClearPopoversEventPayload {
  ignorePopoverFacetId?: string;
}
