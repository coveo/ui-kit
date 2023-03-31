import {buildCustomEvent} from '../../../utils/event-utils';

export interface PopoverChildTab {
  id: string;
}

export const tabsPopoverClass = 'popover-nested';

export function selectTab(host: HTMLElement, tab: PopoverChildTab) {
  host.dispatchEvent(
    buildCustomEvent<PopoverChildTab>('atomic/selectTab', tab)
  );
}
