import {FacetInfo} from '../../../common/facets/facet-common-store';

export interface PopoverChildFacet extends FacetInfo {
  hasValues: () => boolean;
  numberOfSelectedValues: () => number;
}

export interface ClearPopoverEvent {
  popoverEmitterId?: string;
}

export const popoverClass = 'popover-nested';
