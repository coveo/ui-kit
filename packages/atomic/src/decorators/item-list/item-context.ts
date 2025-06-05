import {InitializableComponent} from '@/src/decorators/types.js';
import {LitElement} from 'lit';
import {buildCustomEvent} from '../../utils/event-utils.js';

type LitElementWithError = Pick<InitializableComponent, 'error'> & LitElement;

const itemContextEventName = 'atomic/resolveResult';

export class MissingParentError extends Error {
  constructor(elementName: string, parentName: string) {
    super(
      `The "${elementName}" element must be the child of an "${parentName}" element.`
    );
  }
}

function extractFolded(item: Record<string, unknown>, returnFolded: boolean) {
  if (returnFolded) {
    if ('children' in item) {
      return item;
    } else {
      return {children: [], result: item};
    }
  }

  if ('children' in item && 'result' in item) {
    return item.result;
  }
  return item;
}

export function ItemContext(
  opts: {parentName: string; folded: boolean} = {
    parentName: 'atomic-result',
    folded: false,
  }
) {
  return (component: LitElementWithError, itemVariable: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const {connectedCallback, updated, render} = component as any;
    component.connectedCallback = function () {
      const event = buildCustomEvent(
        itemContextEventName,
        (item: Record<string, unknown>) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (this as any)[itemVariable] = extractFolded(item, opts.folded);
        }
      );

      const canceled = this.dispatchEvent(event);
      if (canceled) {
        this.error = new MissingParentError(
          this.nodeName.toLowerCase(),
          opts.parentName
        );
        return;
      }
      return connectedCallback && connectedCallback.call(this);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (component as any).updated = function (...args: any[]) {
      if (this.error) {
        return;
      }
      return updated && updated.call(this, ...args);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (component as any).render = function (...args: any[]) {
      if (this.error) {
        this.remove();
        console.error(
          'Result component is in error and has been removed from the DOM',
          this.error,
          this,
          this
        );
        return;
      }
      return render && render.call(this, ...args);
    };
  };
}

type ItemContextEventHandler<T> = (item: T) => void;
export type ItemContextEvent<T> = CustomEvent<ItemContextEventHandler<T>>;
