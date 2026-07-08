import {ChangeDetectionStrategy, Component, input} from '@angular/core';
import type {BoundProperty} from '@a2ui/angular/v0_9';
import {prop} from '../a2ui/prop-reader';
import type {ProductRecord} from '../models';

@Component({
  selector: 'app-comparison-table',
  template: `
    <section class="surface">
      <header class="surface-header">
        <p class="surface-kicker">Comparison Table</p>
        <h3>{{ heading() }}</h3>
      </header>

      @if (isLoading() || products().length === 0) {
        <div class="loading-table"></div>
      } @else {
        <div class="product-strip">
          @for (product of products(); track product.ec_product_id) {
            <article class="product-card">
              @if (product.ec_image) {
                <img
                  class="product-image"
                  [src]="product.ec_image"
                  [alt]="product.ec_name"
                  loading="lazy"
                />
              } @else {
                <div class="product-image-placeholder"></div>
              }
              <div class="product-info">
                <span class="product-brand">{{ product.ec_brand }}</span>
                <strong class="product-name">{{ product.ec_name }}</strong>
                <span class="product-price">{{
                  formatPrice(product.ec_promo_price ?? product.ec_price)
                }}</span>
              </div>
            </article>
          }
        </div>

        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                @for (attribute of attributes(); track attribute) {
                  <th>{{ formatLabel(attribute) }}</th>
                }
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              @for (product of products(); track product.ec_product_id) {
                <tr>
                  <td>
                    <strong>{{ product.ec_name }}</strong>
                    <span>{{ product.ec_brand }}</span>
                  </td>
                  @for (attribute of attributes(); track attribute) {
                    <td>{{ product[attribute] || '—' }}</td>
                  }
                  <td>
                    {{
                      formatPrice(product.ec_promo_price ?? product.ec_price)
                    }}
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </section>
  `,
  styles: [
    `
      .surface-header {
        margin-bottom: 16px;
      }

      .surface-kicker {
        margin: 0 0 6px;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        font-size: 0.74rem;
        color: #516661;
      }

      h3 {
        margin: 0;
      }

      .table-wrap {
        overflow-x: auto;
        margin-top: 14px;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        min-width: 560px;
      }

      th,
      td {
        padding: 12px 10px;
        border-bottom: 1px solid rgba(17, 35, 31, 0.12);
        text-align: left;
        vertical-align: top;
      }

      td span {
        display: block;
        margin-top: 4px;
        color: #516661;
        font-size: 0.92rem;
      }

      .product-strip {
        display: flex;
        gap: 14px;
        overflow-x: auto;
        scroll-snap-type: x mandatory;
        padding-bottom: 8px;
      }

      .product-card {
        flex: 0 0 200px;
        scroll-snap-align: start;
        border-radius: 18px;
        background: rgba(255, 255, 255, 0.8);
        border: 1px solid rgba(17, 35, 31, 0.08);
        overflow: hidden;
      }

      .product-image {
        width: 100%;
        height: 130px;
        object-fit: cover;
        background: #f0ece4;
      }

      .product-image-placeholder {
        width: 100%;
        height: 130px;
        background: linear-gradient(135deg, #e7d8c8, #c6a889);
      }

      .product-info {
        padding: 12px 14px;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .product-brand {
        text-transform: uppercase;
        letter-spacing: 0.08em;
        font-size: 0.7rem;
        color: #516661;
      }

      .product-name {
        font-size: 0.88rem;
      }

      .product-price {
        font-size: 0.85rem;
        font-weight: 600;
        color: #204f46;
      }

      .loading-table {
        height: 220px;
        border-radius: 18px;
        background: linear-gradient(
          90deg,
          rgba(231, 221, 209, 0.95),
          rgba(247, 241, 232, 0.95),
          rgba(231, 221, 209, 0.95)
        );
        background-size: 200% 100%;
        animation: shimmer 1.25s linear infinite;
      }

      @keyframes shimmer {
        0% {
          background-position: 200% 0;
        }
        100% {
          background-position: -200% 0;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComparisonTableComponent {
  readonly props = input<Record<string, BoundProperty>>({});
  readonly surfaceId = input<string>('');
  readonly componentId = input<string>('');
  readonly dataContextPath = input<string>('');

  protected readonly heading = prop(this.props, 'heading', '');
  protected readonly attributes = prop(
    this.props,
    'attributes',
    [] as string[]
  );
  protected readonly products = prop(
    this.props,
    'products',
    [] as ProductRecord[]
  );
  protected readonly isLoading = prop(this.props, 'isLoading', false);

  protected formatLabel(value: string): string {
    return value.replace(/_/g, ' ');
  }

  protected formatPrice(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  }
}
