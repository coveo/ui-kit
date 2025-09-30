import {Product} from '@coveo/headless/commerce';
import {itemContext} from '@/src/components/common/item-list/stencil-item-decorators';

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
