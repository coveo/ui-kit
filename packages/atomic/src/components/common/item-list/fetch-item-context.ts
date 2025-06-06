import {MissingParentError} from '@/src/decorators/item-list/item-context.js';
import {closest} from '../../../utils/dom-utils.js';
import {buildCustomEvent} from '../../../utils/event-utils.js';

const itemContextEventName = 'atomic/resolveResult';

type ItemContextEventHandler<T> = (item: T) => void;

export function fetchItemContext<T>(element: Element, parentName: string) {
  return new Promise<T>((resolve, reject) => {
    const event = buildCustomEvent<ItemContextEventHandler<T>>(
      itemContextEventName,
      (item: T) => {
        return resolve(item);
      }
    );
    element.dispatchEvent(event);

    if (!closest(element, parentName)) {
      reject(
        new MissingParentError(element.nodeName.toLowerCase(), parentName)
      );
    }
  });
}
