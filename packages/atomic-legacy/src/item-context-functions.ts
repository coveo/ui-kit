import type {FoldedResult, Result} from '@coveo/headless';
import type {Product} from '@coveo/headless/commerce';

type ItemContextEventHandler<T> = (item: T) => void;
const itemContextEventName = 'atomic/resolveResult';
class MissingParentError extends Error {
  constructor(elementName: string, parentName: string) {
    super(
      `The "${elementName}" element must be the child of an "${parentName}" element.`
    );
  }
}
function buildCustomEvent<T>(name: string, detail: T) {
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

/**
 * @deprecated should only be used for Stencil components. For Lit components, use `itemContext` from \@/src/components/common/item-list/item-context.js.
 */
function itemContext<T>(element: Element, parentName: string) {
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

/**
 * Retrieves `Product` on a rendered `atomic-product`.
 *
 * This method is useful for building custom product template elements, see [Create a Product List](https://docs.coveo.com/en/atomic/latest/cc-search/create-custom-components/native-components/#custom-product-template-component-example) for more information.
 *
 * You should use the method in the [connectedCallback lifecycle method](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements#using_the_lifecycle_callbacks).
 *
 * @param element - The element that the event is dispatched to, which must be the child of a rendered "atomic-product".
 * @returns A promise that resolves on initialization of the parent "atomic-product" element, or rejects when there is no parent "atomic-product" element.
 *
 * @deprecated should only be used for Stencil components. For Lit components, use `fetchProductContext` from \@/src/components/commerce/product-template-component-utils/context/fetch-product-context.ts
 */
export function productContext<T extends Product>(element: Element) {
  return itemContext<T>(element, 'atomic-product');
}

/**
 * Retrieves `Result` on a rendered `atomic-result`.
 *
 * This method is useful for building custom result template elements, see [Create a Result List](https://docs.coveo.com/en/atomic/latest/cc-search/create-custom-components/native-components/#custom-result-template-component-example) for more information.
 *
 * You should use the method in the [connectedCallback lifecycle method](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements#using_the_lifecycle_callbacks).
 *
 * @param element The element that the event is dispatched to, which must be the child of a rendered "atomic-result" element.
 * @returns A promise that resolves on initialization of the parent "atomic-result" element, or rejects when there is no parent "atomic-result" element.
 *
 * @deprecated should only be used for Stencil components. For Lit components, use `fetchResultContext` from \@/src/components/search/result-template-component-utils/context/fetch-result-context.ts
 */
export function resultContext<T extends Result | FoldedResult = Result>(
  element: Element
) {
  return itemContext<T>(element, 'atomic-result');
}
