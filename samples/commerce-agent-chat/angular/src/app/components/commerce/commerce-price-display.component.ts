import {CommonModule} from '@angular/common';
import {Component, Input} from '@angular/core';

import {
  formatPrice,
  hasDiscount,
  promoPrice,
} from '@core/lib/commerceHelpers.js';
import type {Product} from '@core/types/commerce.js';

@Component({
  selector: 'app-commerce-price-display',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="price-display">
      @if (hasPromoDiscount()) {
        <span class="price-original">{{ formatPrice(product.ec_price) }}</span>
        <span class="price-promo">{{ formatPrice(promo()) }}</span>
      } @else {
        <span class="price-regular">{{ formatPrice(product.ec_price) }}</span>
      }
    </span>
  `,
  styles: [
    `
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
        color: #ffffff;
        background: linear-gradient(
          135deg,
          var(--accent-warm) 0%,
          var(--accent-hot) 100%
        );
        border-radius: 6px;
        padding: 0.15em 0.5em;
        box-shadow: 0 0 10px rgba(255, 183, 0, 0.3);
      }
    `,
  ],
})
export class CommercePriceDisplayComponent {
  @Input({required: true}) product!: Product;

  protected readonly formatPrice = formatPrice;

  protected promo(): number | null {
    return promoPrice(this.product);
  }

  protected hasPromoDiscount(): boolean {
    return hasDiscount(this.product);
  }
}
