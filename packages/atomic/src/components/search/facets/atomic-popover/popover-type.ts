import {buildCustomEvent} from '../../../../utils/event-utils';
import {FacetInfo} from '../../../common/facets/facet-common-store';

export interface PopoverChildFacet extends FacetInfo {
  hasValues: () => boolean;
  numberOfSelectedValues: () => number;
}

export interface ClearPopoverEvent {
  popoverEmitterId?: string;
}

export const popoverClass = 'popover-nested';

export function initializePopover(
  host: HTMLElement,
  childFacet: PopoverChildFacet
) {
  host.dispatchEvent(
    buildCustomEvent<PopoverChildFacet>('atomic/initializePopover', childFacet)
  );
}
