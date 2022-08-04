import {FacetType} from '../../../common/facets/facet-common';

export interface InitPopoverEventPayload {
  facetId: string;
  facetType: FacetType;
  getNumberOfValues: () => number;
  getNumberOfSelectedValues: () => string;
}

export interface ClearPopoversEventPayload {
  ignorePopoverFacetId?: string;
}
