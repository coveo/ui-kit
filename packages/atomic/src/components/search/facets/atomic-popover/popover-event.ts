import {FacetInfo} from '../../../common/facets/facet-common-store';

export interface InitializePopoverEvent {
  facetInfo: FacetInfo;
  getHasValues: () => boolean;
  getNumberOfSelectedValues: () => number;
}
