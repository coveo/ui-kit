import {closest} from '@/src/utils/dom-utils';
import {ComponentInterface, getElement} from '@stencil/core';
import {buildCustomEvent} from '../../../utils/event-utils';
import {AnyItem} from './unfolded-item';
import {
  ItemDisplayDensity,
  ItemDisplayImageSize,
} from '../layout/display-options';
import {ResultTemplateProvider} from './result-template-provider';

export class MissingParentError extends Error {
  constructor(elementName: string, parentName: string) {
    super(
      `The "${elementName}" element must be the child of an "${parentName}" element.`
    );
  }
}
/**
 * @deprecated should only be used for Stencil components. For Lit components, use `ItemContext` from \@/src/decorators/item-list/item-context.js.
 */
export function ItemContext(
  opts: {parentName: string; folded: boolean} = {
    parentName: 'atomic-result',
    folded: false,
  }
) {
  return (component: ComponentInterface, itemVariable: string) => {
    const {connectedCallback, componentWillRender, render} = component;
    component.connectedCallback = function () {
      const element = getElement(this);
      const event = buildCustomEvent(
        itemContextEventName,
        (item: Record<string, unknown>) => {
          this[itemVariable] = extractFolded(item, opts.folded);
        }
      );

      const canceled = element.dispatchEvent(event);
      if (canceled) {
        this.error = new MissingParentError(
          element.nodeName.toLowerCase(),
          opts.parentName
        );
        return;
      }
      return connectedCallback && connectedCallback.call(this);
    };

    component.componentWillRender = function () {
      if (this.error) {
        return;
      }

      return componentWillRender && componentWillRender.call(this);
    };

    component.render = function () {
      if (this.error) {
        const element = getElement(this);
        element.remove();
        console.error(
          'Result component is in error and has been removed from the DOM',
          this.error,
          this,
          element
        );
        return;
      }
      return render && render.call(this);
    };
  };
}

/**
 * @deprecated should only be used for Stencil components. For Lit components, use `InteractiveItemContext` from \@/src/decorators/item-list/interactive-item-context.js.
 */
export function InteractiveItemContext() {
  return (component: ComponentInterface, interactiveItemVariable: string) => {
    const {connectedCallback} = component;
    component.connectedCallback = function () {
      const element = getElement(this);
      const event = buildCustomEvent(
        interactiveItemContextEventName,
        (item: AnyItem) => {
          this[interactiveItemVariable] = item;
        }
      );
      element.dispatchEvent(event);
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

/**
 * @deprecated should only be used for Stencil components. For Lit components, use `itemContext` from \@/src/components/common/item-list/item-context.js.
 */
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
  itemTemplateProvider?: ResultTemplateProvider
) => void;
export type ChildTemplatesContextEvent =
  CustomEvent<ChildTemplatesContextEventHandler>;
const childTemplatesContextEventName = 'atomic/resolveChildTemplates';

interface AtomicItemChildren {
  itemTemplateProvider?: ResultTemplateProvider;
}

/**
 * @deprecated should only be used for Stencil components. For Lit components, use `ChildTemplatesContext` from \@/src/decorators/item-list/child-templates-context.js.
 */
export function ChildTemplatesContext() {
  return (component: ComponentInterface, itemTemplateProviderProp: string) => {
    const {componentWillRender} = component;
    component.componentWillRender = function () {
      const element = getElement(this);
      const event = buildCustomEvent(
        childTemplatesContextEventName,
        (itemTemplateProvider?: ResultTemplateProvider) => {
          const component = this as AtomicItemChildren;
          if (component.itemTemplateProvider) {
            return;
          }

          this[itemTemplateProviderProp] = itemTemplateProvider;
        }
      );

      const canceled = element.dispatchEvent(event);
      if (canceled) {
        this[itemTemplateProviderProp] = null;
        return;
      }
      return componentWillRender && componentWillRender.call(this);
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

/**
 * @deprecated should only be used for Stencil components. For Lit components, use `ItemDisplayConfigContext` from \@/src/decorators/item-list/item-display-config-context.js.
 */
export function ItemDisplayConfigContext() {
  return (component: ComponentInterface, itemVariable: string) => {
    const {componentWillRender} = component;
    component.componentWillRender = function () {
      const element = getElement(this);
      const event = buildCustomEvent(
        itemDisplayConfigContextEventName,
        (config: DisplayConfig) => {
          this[itemVariable] = config;
        }
      );

      const canceled = element.dispatchEvent(event);
      if (canceled) {
        return;
      }
      return componentWillRender && componentWillRender.call(this);
    };
  };
}
