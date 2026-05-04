import {ComponentInterface, getElement} from '@stencil/core';

import type {FoldedResult, Result} from '@coveo/headless';
import type {Product} from '@coveo/headless/commerce';
import type {Result as InsightResult} from '@coveo/headless/insight';

import type {Template, TemplatesManager} from '@coveo/headless';

export interface TemplateElement<ItemType> extends HTMLElement {
  getTemplate(): Promise<Template<ItemType, DocumentFragment> | null>;
}

export interface TemplateProviderProps<ItemType> {
  getResultTemplateRegistered(): boolean;
  setResultTemplateRegistered(value: boolean): void;
  getTemplateHasError(): boolean;
  setTemplateHasError(value: boolean): void;
  templateElements: TemplateElement<ItemType>[];
  includeDefaultTemplate: boolean;
}

export abstract class TemplateProvider<ItemType> {
  private templateManager: TemplatesManager<
    ItemType,
    DocumentFragment,
    DocumentFragment
  >;

  protected abstract makeDefaultTemplate(): Template<
    ItemType,
    DocumentFragment,
    DocumentFragment
  >;

  constructor(
    private props: TemplateProviderProps<ItemType>,
    private buildManager: () => TemplatesManager<
      ItemType,
      DocumentFragment,
      DocumentFragment
    >
  ) {
    this.templateManager = this.buildManager();
    this.registerResultTemplates();
  }

  private async registerResultTemplates() {
    const customTemplates = await Promise.all(
      this.props.templateElements.map(async (resultTemplateElement) => {
        if (!('getTemplate' in resultTemplateElement)) {
          await customElements.whenDefined(
            (resultTemplateElement as HTMLElement).tagName.toLowerCase()
          );
        }

        const template = await resultTemplateElement.getTemplate();
        if (!template) {
          this.props.setTemplateHasError(true);
        }
        return template;
      })
    );

    const templates = (
      !customTemplates.length && this.props.includeDefaultTemplate
        ? [this.makeDefaultTemplate()]
        : []
    ).concat(
      customTemplates.filter((template) => template) as Template<
        ItemType,
        DocumentFragment,
        DocumentFragment
      >[]
    );

    this.templateManager.registerTemplates(...templates);
    this.props.setResultTemplateRegistered(true);
  }

  public getTemplateContent(item: ItemType) {
    return this.templateManager.selectTemplate(item)!;
  }

  public getLinkTemplateContent(item: ItemType) {
    return this.templateManager.selectLinkTemplate(item)!;
  }

  public getEmptyLinkTemplateContent() {
    return document.createDocumentFragment();
  }

  public get templatesRegistered() {
    return this.props.getResultTemplateRegistered();
  }

  public get hasError() {
    return this.props.getTemplateHasError();
  }
}

type ItemDisplayDensity = 'comfortable' | 'normal' | 'compact';
type ItemDisplayImageSize = 'large' | 'small' | 'icon' | 'none';
type AnyItem = FoldedResult | AnyUnfoldedItem | Product;
type AnyUnfoldedItem = Result | InsightResult;

function closest<K extends keyof HTMLElementTagNameMap>(
  element: Element | null,
  selector: K
): HTMLElementTagNameMap[K] | null;
function closest<K extends keyof SVGElementTagNameMap>(
  element: Element | null,
  selector: K
): SVGElementTagNameMap[K] | null;
function closest<E extends Element = Element>(
  element: Element | null,
  selector: string
): E | null;
function closest(
  element: Element | null,
  selector: string
): HTMLElement | null {
  if (!element) {
    return null;
  }
  if (element.matches(selector)) {
    return element as HTMLElement;
  }
  if (element.parentNode instanceof ShadowRoot) {
    return closest(element.parentNode.host, selector);
  }
  return closest(element.parentElement, selector);
}

function buildCustomEvent<T = undefined>(name: string, detail?: T) {
  return new CustomEvent(name, {
    detail,
    // Event will bubble up the DOM until it is caught
    bubbles: true,
    // Allows to verify if event is caught (cancelled). If it's not caught, it won't be initialized.
    cancelable: true,
    // Allows to compose Atomic components inside one another, event will go across DOM/Shadow DOM
    composed: true,
  });
}

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

type DisplayConfig = {
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