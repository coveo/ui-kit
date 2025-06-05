import {AnyItem} from '@/src/components/common/interface/item.js';
import {LitElement} from 'lit';
import {buildCustomEvent} from '../../utils/event-utils.js';

const interactiveItemContextEventName = 'atomic/resolveInteractiveResult';

export function InteractiveItemContext() {
  return (component: LitElement, interactiveItemVariable: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const {connectedCallback} = component as any;
    component.connectedCallback = function () {
      const event = buildCustomEvent(
        interactiveItemContextEventName,
        (item: AnyItem) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (this as any)[interactiveItemVariable] = item;
        }
      );
      this.dispatchEvent(event);
      return connectedCallback && connectedCallback.call(this);
    };
  };
}

export type InteractiveItemContextEvent = CustomEvent<
  (interactiveItem: unknown) => void
>;
