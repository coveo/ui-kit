import {customElement, property} from 'lit/decorators.js';
import {css, html, LitElement, nothing} from 'lit';
import {when} from 'lit/directives/when.js';
import {
  formatPrice,
  hasDiscount,
  promoPrice,
} from '@coveo/commerce-agent-chat-core/lib/commerceHelpers';
import type {Product} from '@coveo/commerce-agent-chat-core/types/commerce';

/**
 * The `atomock-product-price` component renders product prices with optional promotional styling.
 *
 * @part regular - The regular price element.
 * @part original - The original price element when a promotion exists.
 * @part promo - The promotional price element.
 */
@customElement('atomock-product-price')
export class AtomockProductPrice extends LitElement {
  static override styles = css`
    :host {
      display: block;
    }

    .price-display {
      display: inline-flex;
      align-items: center;
      gap: var(--atomock-product-price-gap, 0.4rem);
      flex-wrap: wrap;
    }

    .price-regular {
      font-weight: var(--atomock-product-price-font-weight, 700);
      font-size: var(--atomock-product-price-font-size, 0.9rem);
      color: var(--atomock-product-price-color, var(--ink));
    }

    .price-original {
      font-size: var(--atomock-product-price-original-font-size, 0.8rem);
      color: var(--atomock-product-price-original-color, var(--text-secondary));
      text-decoration: line-through;
    }

    .price-promo {
      font-size: var(--atomock-product-price-promo-font-size, 0.85rem);
      font-weight: var(--atomock-product-price-promo-font-weight, 700);
      color: var(--atomock-product-price-promo-color, #92400e);
      background: var(--atomock-product-price-promo-bg, #fef3c7);
      border: 1px solid var(--atomock-product-price-promo-border, #f6d38a);
      border-radius: 4px;
      padding: 0.15em 0.5em;
    }
  `;

  /** The optional product model used to compute regular/promo prices. */
  @property({attribute: false})
  public product?: Product;

  /** The regular price text value when no Product model is provided. */
  @property({type: String})
  public value = '';

  /** The original price text value when rendering a promotional value. */
  @property({type: String, attribute: 'original-value'})
  public originalValue = '';

  /** Whether to render `value` as promotional and `originalValue` as struck-through. */
  @property({type: Boolean, attribute: 'is-promotional'})
  public isPromotional = false;

  override render() {
    if (this.product) {
      return this.renderProductPrice(this.product);
    }

    if (!this.value) {
      return nothing;
    }

    return html`
      <span class="price-display">
        ${when(
          this.isPromotional && Boolean(this.originalValue),
          () => html`
            <span class="price-original" part="original"
              >${this.originalValue}</span
            >
            <span class="price-promo" part="promo">${this.value}</span>
          `,
          () =>
            html`<span class="price-regular" part="regular"
              >${this.value}</span
            >`
        )}
      </span>
    `;
  }

  private renderProductPrice(product: Product) {
    const hasPromoDiscount = hasDiscount(product);
    const regularPrice = formatPrice(product.ec_price);
    const promotionalPrice = formatPrice(promoPrice(product));

    return html`
      <span class="price-display">
        ${when(
          hasPromoDiscount,
          () => html`
            <span class="price-original" part="original">${regularPrice}</span>
            <span class="price-promo" part="promo">${promotionalPrice}</span>
          `,
          () =>
            html`<span class="price-regular" part="regular"
              >${regularPrice}</span
            >`
        )}
      </span>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomock-product-price': AtomockProductPrice;
  }
}
