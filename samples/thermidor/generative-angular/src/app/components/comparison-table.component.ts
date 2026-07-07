import {ChangeDetectionStrategy, Component, input} from '@angular/core';
import {ComparisonTableSurface} from '../models';

@Component({
  selector: 'app-comparison-table',
  template: `
    <section class="surface">
      <header class="surface-header">
        <p class="surface-kicker">Comparison Table</p>
        <h3>{{ surface().heading }}</h3>
      </header>

      @if (surface().isLoading || surface().products.length === 0) {
        <div class="loading-table"></div>
      } @else {
        <div class="product-strip">
          @for (product of surface().products; track product.ec_product_id) {
            <article class="product-pill">
              <span>{{ product.ec_brand }}</span>
              <strong>{{ product.ec_name }}</strong>
            </article>
          }
        </div>

        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                @for (attribute of surface().attributes; track attribute) {
                  <th>{{ formatLabel(attribute) }}</th>
                }
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              @for (
                product of surface().products;
                track product.ec_product_id
              ) {
                <tr>
                  <td>
                    <strong>{{ product.ec_name }}</strong>
                    <span>{{ product.ec_brand }}</span>
                  </td>
                  @for (attribute of surface().attributes; track attribute) {
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
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 10px;
      }

      .product-pill {
        padding: 12px 14px;
        border-radius: 18px;
        background: rgba(246, 242, 232, 0.92);
        border: 1px solid rgba(17, 35, 31, 0.08);
      }

      .product-pill span {
        display: block;
        margin-bottom: 6px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        font-size: 0.7rem;
        color: #516661;
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
  readonly surface = input.required<ComparisonTableSurface>();

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
