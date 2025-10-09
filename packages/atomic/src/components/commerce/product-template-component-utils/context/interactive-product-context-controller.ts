import type {InteractiveProduct} from '@coveo/headless/commerce';
import type {LitElement} from 'lit';
import {InteractiveItemContextController} from '@/src/components/common/item-list/context/interactive-item-context-controller';

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
