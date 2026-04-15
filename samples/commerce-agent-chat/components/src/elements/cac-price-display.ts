import {customElement, property} from 'lit/decorators.js';
import {html, LitElement, nothing} from 'lit';
import type {Product} from '@coveo/commerce-agent-chat-core/types/commerce';
import './atomock-product-price.js';

/**
 * The `cac-price-display` component renders regular and promo price labels.
 */
@customElement('cac-price-display')
export class CacPriceDisplay extends LitElement {
  /** The product model used to render price information. */
  @property({attribute: false})
  public product!: Product;

  override render() {
    if (!this.product) {
      return nothing;
    }

    return html`<atomock-product-price
      .product=${this.product}
    ></atomock-product-price>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'cac-price-display': CacPriceDisplay;
  }
}
