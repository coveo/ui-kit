import {buildCustomEvent} from '../../../../utils/event-utils';
import type {FacetInfo} from '../../../common/facets/facet-common-store';

export interface PopoverChildFacet extends FacetInfo {
  hasValues: () => boolean;
  numberOfActiveValues: () => number;
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
