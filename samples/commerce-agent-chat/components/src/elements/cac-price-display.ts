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
 * The `cac-price-display` component renders regular and promo price labels.
 */
@customElement('cac-price-display')
export class CacPriceDisplay extends LitElement {
  static override styles = css`
    .price-display {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
    }

    .price-regular {
      font-weight: 700;
      font-size: 0.9rem;
      color: var(--accent);
      text-shadow: 0 0 8px rgba(0, 212, 255, 0.3);
    }

    .price-original {
      font-size: 0.8rem;
      color: var(--text-secondary);
      text-decoration: line-through;
    }

    .price-promo {
      font-size: 0.85rem;
      font-weight: 700;
      color: #fff;
      background: linear-gradient(
        135deg,
        var(--accent-warm) 0%,
        var(--accent-hot) 100%
      );
      border-radius: 6px;
      padding: 0.15em 0.5em;
      box-shadow: 0 0 10px rgba(255, 183, 0, 0.3);
    }
  `;

  /** The product model used to render price information. */
  @property({attribute: false})
  public product!: Product;

  override render() {
    if (!this.product) {
      return nothing;
    }

    const promo = promoPrice(this.product);
    const hasPromoDiscount = hasDiscount(this.product);

    return html`
      <span class="price-display">
        ${when(
          hasPromoDiscount,
          () => html`
            <span class="price-original"
              >${formatPrice(this.product.ec_price)}</span
            >
            <span class="price-promo">${formatPrice(promo)}</span>
          `,
          () =>
            html`<span class="price-regular"
              >${formatPrice(this.product.ec_price)}</span
            >`
        )}
      </span>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'cac-price-display': CacPriceDisplay;
  }
}
