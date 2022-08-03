import {FacetType} from '../../../common/facets/facet-common';

export interface InitPopoverEventPayload {
  facetId: string;
  facetType: FacetType;
}

export interface ClearPopoversEventPayload {
  ignorePopoverFacetId?: string;
}
