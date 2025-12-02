import {buildCustomEvent} from '../../../utils/event-utils.js';

const tabLoadedEventName = 'atomic/tabRendered';

export const dispatchTabLoaded = (element: HTMLElement) => {
  const event = buildCustomEvent(tabLoadedEventName, {});

  element.dispatchEvent(event);
};

export interface TabCommon {
  active: boolean;
  label: string;
  select: () => void;
}

export type TabCommonElement = TabCommon & HTMLElement;
