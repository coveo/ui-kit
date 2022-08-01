import {StoreFacetType} from '../../atomic-search-interface/store';

export interface InitPopoverEventPayload {
  facetId: string;
  facetType: StoreFacetType;
}
