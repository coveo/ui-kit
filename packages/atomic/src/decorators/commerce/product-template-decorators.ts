import {InteractiveItemContextController} from '@/src/components/common/item-list/context/interactive-item-context-controller';
import {InteractiveItemContextEvent} from '@/src/components/common/item-list/context/interactive-item-context-controller';
import {
  ItemContextController,
  ItemContextEvent,
} from '@/src/components/common/item-list/context/item-context-controller';
import {fetchItemContext} from '@/src/components/common/item-list/fetch-item-context';
import {InteractiveProduct, Product} from '@coveo/headless/commerce';
import {LitElement} from 'lit';

/**
 * Creates a [Lit reactive controller](https://lit.dev/docs/composition/controllers/) for managing product context in product template components.
 *
 * @param host - The Lit component instance
 * @param options - Configuration options
 * @returns ItemContextController instance configured for atomic-product
 *
 * @example
 * ```typescript
 * @customElement('my-product-component')
 * export class MyProductComponent extends LitElement {
 *   private productController = createProductContextController(this);
 *
 *   @state() product!: Product;
 *
 *   render() {
 *     this.product = this.productController.item;
 *     return html`<div>${this.product?.ec_name}</div>`;
 *   }
 * }
 * ```
 */
export function createProductContextController(
  host: LitElement & {error: Error | null},
  options: {folded?: boolean} = {}
): ItemContextController<Product> {
  return new ItemContextController<Product>(host, {
    parentName: 'atomic-product',
    folded: options.folded ?? false,
  });
}

/**
 * Creates a [Lit reactive controller](https://lit.dev/docs/composition/controllers/) for managing interactive product context in product template components.
 *
 * @param host - The Lit component instance
 * @returns InteractiveItemContextController instance
 *
 * @example
 * ```typescript
 * @customElement('my-interactive-product-component')
 * export class MyInteractiveProductComponent extends LitElement {
 *   private interactiveProductController = createInteractiveProductContextController(this);
 *
 *   @state() product!: Product;
 *
 *   render() {
 *     this.product = this.interactiveProductController.interactiveItem;
 *     return html`<div>${this.product?.ec_name}</div>`;
 *   }
 * }
 * ```
 */
export function createInteractiveProductContextController(
  host: LitElement & {error: Error}
): InteractiveItemContextController<InteractiveProduct> {
  return new InteractiveItemContextController<InteractiveProduct>(host);
}

export type ProductContextEvent<T = Product> = ItemContextEvent<T>;
export type InteractiveProductContextEvent<
  T extends InteractiveProduct = InteractiveProduct,
> = InteractiveItemContextEvent<T>;

/**
 * Retrieves `Product` on a rendered `atomic-product`.
 *
 * This utility function is useful for building custom product template elements, see [Create a Product List](https://docs.coveo.com/en/atomic/latest/cc-search/create-custom-components/native-components/#custom-product-template-component-example) for more information.
 *
 * You should use the utility function in the [`connectedCallback` lifecycle method](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements#using_the_lifecycle_callbacks).
 *
 * @param element - The element that the event is dispatched to, which must be the child of a rendered `atomic-product`.
 * @returns A promise that resolves on initialization of the parent `atomic-product` element, or rejects when there is no parent `atomic-product` element.
 */
export function fetchProductContext<T extends Product>(element: Element) {
  return fetchItemContext<T>(element, 'atomic-product');
}
