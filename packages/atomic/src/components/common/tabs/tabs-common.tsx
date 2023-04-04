import {buildCustomEvent} from '../../../utils/event-utils';

export const tabLoadedEventName = 'atomic/tabRendered';

export const dispatchTabLoaded = (element: HTMLElement) => {
  const event = buildCustomEvent(tabLoadedEventName, {});

  element.dispatchEvent(event);
};
