import {
  interactiveItemContext,
  InteractiveItemContextEvent,
} from '@/src/decorators/item-list/interactive-item-context';
import {
  itemContext,
  ItemContextEvent,
} from '@/src/decorators/item-list/item-context';
import {Product} from '@coveo/headless/commerce';
import {fetchItemContext} from '../../common/item-list/fetch-item-context';

/**
 * A [Lit property decorator](https://lit.dev/docs/components/decorators/) to be used for product template components.
 * This allows the Lit component to fetch the current product from its rendered parent, the `atomic-product` component.
 *
 * Example:
 * ```
 * @ProductContext() product!: Product;
 * ```
 *
 * For more information and examples, see the [Utilities section](https://github.com/coveo/ui-kit/tree/master/packages/atomic#utilities) of the Coveo Atomic README.
 */
export function productContext(opts: {folded: boolean} = {folded: false}) {
  return itemContext({parentName: 'atomic-product', folded: opts.folded});
}

export function interactiveProductContext() {
  return interactiveItemContext();
}

export type ProductContextEvent<T = Product> = ItemContextEvent<T>;
export type InteractiveProductContextEvent = InteractiveItemContextEvent;

/**
 * Retrieves `Product` on a rendered `atomic-product`.
 *
 * This utility function is useful for building custom product template elements, see [Create a Product List](https://docs.coveo.com/en/atomic/latest/cc-search/create-custom-components/native-components/#custom-product-template-component-example) for more information.
 *
 * You should use the utility function in the [`connectedCallback` lifecycle method](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements#using_the_lifecycle_callbacks).
Using_custom_elements#using_the_lifecycle_callbacks).
 *
 * @param element - The element that the event is dispatched to, which must be the child of a rendered `atomic-product`.

 * @returns A promise that resolves on initialization of the parent `atomic-product` element, or rejects when there is no parent `atomic-product` element.
element.
 */
export function fetchProductContext<T extends Product>(element: Element) {
  return fetchItemContext<T>(element, 'atomic-product');
}
