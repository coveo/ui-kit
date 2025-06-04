/* eslint-disable @typescript-eslint/no-explicit-any */
import {InitializableComponent} from '@/src/decorators/types.js';
import {LitElement} from 'lit';
import {buildCustomEvent} from '../../../utils/event-utils.js';
import {closest} from '../../../utils/utils.js';
import {AnyItem} from '../interface/item.js';
import {
  ItemDisplayDensity,
  ItemDisplayImageSize,
} from '../layout/display-options.js';
import {ItemTemplateProvider} from './item-template-provider.js';

type LitElementWithError = Pick<InitializableComponent, 'error'> & LitElement;

export class MissingParentError extends Error {
  constructor(elementName: string, parentName: string) {
    super(
      `The "${elementName}" element must be the child of an "${parentName}" element.`
    );
  }
}

export function ItemContext(
  opts: {parentName: string; folded: boolean} = {
    parentName: 'atomic-result',
    folded: false,
  }
) {
  return (component: LitElementWithError, itemVariable: string) => {
    const {connectedCallback, updated, render} = component as any;
    component.connectedCallback = function () {
      console.log('itemvariable', itemVariable);
      const event = buildCustomEvent(
        itemContextEventName,
        (item: Record<string, unknown>) => {
          (this as any)[itemVariable] = extractFolded(item, opts.folded);
          //console.log('item variable set', this[itemVariable]);
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

    (component as any).updated = function (...args: any[]) {
      if (this.error) {
        return;
      }
      return updated && updated.call(this, ...args);
    };

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

export function InteractiveItemContext() {
  return (component: typeof LitElement, interactiveItemVariable: string) => {
    const {connectedCallback} = component.prototype;
    component.prototype.connectedCallback = function () {
      const event = buildCustomEvent(
        interactiveItemContextEventName,
        (item: AnyItem) => {
          (this as any)[interactiveItemVariable] = item;
        }
      );
      this.dispatchEvent(event);
      return connectedCallback && connectedCallback.call(this);
    };
  };
}

type ItemContextEventHandler<T> = (item: T) => void;
export type ItemContextEvent<T> = CustomEvent<ItemContextEventHandler<T>>;
const itemContextEventName = 'atomic/resolveResult';
export type InteractiveItemContextEvent = CustomEvent<
  (interactiveItem: unknown) => void
>;
const interactiveItemContextEventName = 'atomic/resolveInteractiveResult';

export function itemContext<T>(element: Element, parentName: string) {
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

function extractFolded(item: Record<string, unknown>, returnFolded: boolean) {
  console.log('extractFolded', item, returnFolded);
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

type ChildTemplatesContextEventHandler = (
  itemTemplateProvider?: ItemTemplateProvider
) => void;
export type ChildTemplatesContextEvent =
  CustomEvent<ChildTemplatesContextEventHandler>;
const childTemplatesContextEventName = 'atomic/resolveChildTemplates';

interface AtomicItemChildren {
  itemTemplateProvider?: ItemTemplateProvider;
}

export function ChildTemplatesContext() {
  return (component: typeof LitElement, itemTemplateProviderProp: string) => {
    const {updated} = component.prototype as any;
    (component.prototype as any).updated = function (...args: any[]) {
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

export type DisplayConfig = {
  density: ItemDisplayDensity;
  imageSize: ItemDisplayImageSize;
};

type ItemDisplayConfigContextEventHandler = (config: DisplayConfig) => void;
export type ItemDisplayConfigContextEvent =
  CustomEvent<ItemDisplayConfigContextEventHandler>;
const itemDisplayConfigContextEventName = 'atomic/resolveResultDisplayConfig';

export function ItemDisplayConfigContext() {
  return (component: typeof LitElement, itemVariable: string) => {
    const {updated} = component.prototype as any;
    (component.prototype as any).updated = function (...args: any[]) {
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
