import type {InteractiveProduct, Product} from '@coveo/headless/commerce';
import type {LitElement} from 'lit';
import type {InteractiveItemContextEvent} from '@/src/components/common/item-list/context/interactive-item-context-controller';
import {
  ItemContextController,
  type ItemContextEvent,
} from '@/src/components/common/item-list/context/item-context-controller';

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

export type ProductContextEvent<T = Product> = ItemContextEvent<T>;
export type InteractiveProductContextEvent<
  T extends InteractiveProduct = InteractiveProduct,
> = InteractiveItemContextEvent<T>;
