import {
  ItemDisplayDensity,
  ItemDisplayImageSize,
} from '@/src/components/common/layout/display-options';
import {buildCustomEvent} from '@/src/utils/event-utils';
import {LitElement} from 'lit';

const itemDisplayConfigContextEventName = 'atomic/resolveResultDisplayConfig';

export type DisplayConfig = {
  density: ItemDisplayDensity;
  imageSize: ItemDisplayImageSize;
};

export function ItemDisplayConfigContext() {
  return (component: typeof LitElement, itemVariable: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const {updated} = component as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (component as any).updated = function (...args: any[]) {
      const event = buildCustomEvent(
        itemDisplayConfigContextEventName,
        (config: DisplayConfig) => {
          this[itemVariable] = config;
        }
      );

      const canceled = this.dispatchEvent(event);
      if (canceled) {
        return;
      }
      return updated && updated.call(this, ...args);
    };
  };
}

type ItemDisplayConfigContextEventHandler = (config: DisplayConfig) => void;
export type ItemDisplayConfigContextEvent =
  CustomEvent<ItemDisplayConfigContextEventHandler>;
