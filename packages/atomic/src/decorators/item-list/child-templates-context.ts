import {ItemTemplateProvider} from '@/src/components/common/item-list/item-template-provider';
import {buildCustomEvent} from '@/src/utils/event-utils';
import {LitElement} from 'lit';

const childTemplatesContextEventName = 'atomic/resolveChildTemplates';

interface AtomicItemChildren {
  itemTemplateProvider?: ItemTemplateProvider;
}

export function ChildTemplatesContext() {
  return (component: typeof LitElement, itemTemplateProviderProp: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const {updated} = component as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (component as any).updated = function (...args: any[]) {
      const event = buildCustomEvent(
        childTemplatesContextEventName,
        (itemTemplateProvider?: ItemTemplateProvider) => {
          const component = this as AtomicItemChildren;
          if (component.itemTemplateProvider) {
            return;
          }

          this[itemTemplateProviderProp] = itemTemplateProvider;
        }
      );

      const canceled = this.dispatchEvent(event);
      if (canceled) {
        this[itemTemplateProviderProp] = null;
        return;
      }
      return updated && updated.call(this, ...args);
    };
  };
}

type ChildTemplatesContextEventHandler = (
  itemTemplateProvider?: ItemTemplateProvider
) => void;
export type ChildTemplatesContextEvent =
  CustomEvent<ChildTemplatesContextEventHandler>;
