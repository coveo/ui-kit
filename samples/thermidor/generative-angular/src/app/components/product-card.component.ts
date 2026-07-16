import {ChangeDetectionStrategy, Component, input} from '@angular/core';

export interface ProductCardData {
  id: string;
  name: string;
  brand?: string;
  image?: string;
  price?: number;
  promoPrice?: number;
  description?: string;
  accent?: string;
}

@Component({
  selector: 'app-product-card',
  template: `
    @if (product().image) {
      <img
        class="product-image"
        [src]="product().image"
        [alt]="product().name"
        loading="lazy"
      />
    } @else {
      <div
        class="swatch"
        [style.background]="
          product().accent || 'linear-gradient(135deg, #e7d8c8, #c6a889)'
        "
      ></div>
    }
    <p class="brand">{{ product().brand }}</p>
    <h4>{{ product().name }}</h4>
    <p class="description">
      {{ truncate(product().description || 'Barca Sports product', 80) }}
    </p>
    <div class="footer">
      <strong>{{
        formatPrice(product().promoPrice ?? product().price)
      }}</strong>
      <span>{{ product().promoPrice ? 'Sale price' : 'View details' }}</span>
    </div>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        border-radius: 22px;
        padding: 16px;
        border: 1px solid rgba(17, 35, 31, 0.12);
        background: rgba(255, 255, 255, 0.8);
      }

      .brand {
        margin: 0 0 6px;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        font-size: 0.74rem;
        color: #516661;
      }

      h4 {
        margin: 0;
      }

      .product-image {
        width: 100%;
        height: 140px;
        object-fit: cover;
        border-radius: 16px;
        margin-bottom: 12px;
        background: #f0ece4;
      }

      .swatch {
        width: 100%;
        height: 140px;
        border-radius: 16px;
        margin-bottom: 12px;
      }

      .description {
        margin: 12px 0;
        color: #516661;
        line-height: 1.5;
      }

      .footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-top: auto;
      }

      .footer span {
        color: #204f46;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCardComponent {
  readonly product = input.required<ProductCardData>();

  protected formatPrice(value: number | undefined): string {
    if (value === undefined) return '';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  }

  protected truncate(text: string, max: number): string {
    return text.length <= max ? text : text.slice(0, max).trimEnd() + '…';
  }
}
