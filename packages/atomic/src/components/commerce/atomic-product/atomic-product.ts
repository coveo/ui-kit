import type {InteractiveProduct, Product} from '@coveo/headless/commerce';
import type {CSSResultGroup} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {CommerceResultElement} from '@/src/components/commerce/product-list/commerce-result-element';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles';
import styles from './atomic-product.tw.css';
import '../atomic-product-text/atomic-product-text';
import '../atomic-product-link/atomic-product-link';
import '../atomic-product-image/atomic-product-image';

/**
 * The `atomic-product` component is used internally by the `atomic-commerce-product-list` and `atomic-commerce-recommendation-list` components.
 */
@customElement('atomic-product')
@withTailwindStyles
export class AtomicProduct extends CommerceResultElement {
  static styles: CSSResultGroup = styles;

  /**
   * The product item.
   */
  @property({type: Object}) product!: Product;

  /**
   * The InteractiveProduct item.
   */
  @property({type: Object, attribute: 'interactive-product'})
  interactiveProduct!: InteractiveProduct;

  protected readonly elementPrefix = 'atomic-product';

  protected get result() {
    return this.product;
  }

  protected get interactiveResult() {
    return this.interactiveProduct;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-product': AtomicProduct;
  }
}
