import {ChangeDetectionStrategy, Component, input} from '@angular/core';
import type {BoundProperty} from '@a2ui/angular/v0_9';
import {prop} from '../a2ui/prop-reader';
import type {ProductRecord} from '../models';

@Component({
  selector: 'app-product-carousel',
  template: `
    <section class="surface">
      <header class="surface-header">
        <p class="surface-kicker">Product Carousel</p>
        <h3>{{ heading() }}</h3>
      </header>

      @if (isLoading() || products().length === 0) {
        <div class="loading-grid">
          @for (item of placeholders; track $index) {
            <div class="loading-card"></div>
          }
        </div>
      } @else {
        <div class="carousel">
          @for (item of products(); track item.ec_product_id) {
            <article class="card">
              @if (item.ec_image) {
                <img
                  class="product-image"
                  [src]="item.ec_image"
                  [alt]="item.ec_name"
                  loading="lazy"
                />
              } @else {
                <div
                  class="swatch"
                  [style.background]="
                    item.accent || 'linear-gradient(135deg, #e7d8c8, #c6a889)'
                  "
                ></div>
              }
              <p class="brand">{{ item.ec_brand }}</p>
              <h4>{{ item.ec_name }}</h4>
              <p class="description">
                {{ item.description || 'Barca Sports product' }}
              </p>
              <div class="footer">
                <strong>{{
                  formatPrice(item.ec_promo_price ?? item.ec_price)
                }}</strong>
                <span>{{
                  item.ec_promo_price ? 'Sale price' : 'View details'
                }}</span>
              </div>
            </article>
          }
        </div>
      }
    </section>
  `,
  styles: [
    `
      .surface-header {
        margin-bottom: 16px;
      }

      .surface-kicker,
      .brand,
      .meta {
        margin: 0 0 6px;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        font-size: 0.74rem;
        color: #516661;
      }

      h3,
      h4 {
        margin: 0;
      }

      .carousel,
      .loading-grid {
        display: flex;
        gap: 14px;
        overflow-x: auto;
        scroll-snap-type: x mandatory;
        padding-bottom: 8px;
      }

      .card,
      .loading-card {
        flex: 0 0 240px;
        scroll-snap-align: start;
        border-radius: 22px;
        padding: 16px;
        border: 1px solid rgba(17, 35, 31, 0.12);
        background: rgba(255, 255, 255, 0.8);
      }

      .loading-card {
        min-height: 220px;
        background: linear-gradient(
          90deg,
          rgba(231, 221, 209, 0.95),
          rgba(247, 241, 232, 0.95),
          rgba(231, 221, 209, 0.95)
        );
        background-size: 200% 100%;
        animation: shimmer 1.25s linear infinite;
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

      .meta {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
      }

      .footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-top: 12px;
      }

      .footer span {
        color: #204f46;
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
export class ProductCarouselComponent {
  protected readonly placeholders = Array.from({length: 3});

  readonly props = input<Record<string, BoundProperty>>({});
  readonly surfaceId = input<string>('');
  readonly componentId = input<string>('');
  readonly dataContextPath = input<string>('');

  protected readonly heading = prop(this.props, 'heading', '');
  protected readonly products = prop(
    this.props,
    'products',
    [] as ProductRecord[]
  );
  protected readonly isLoading = prop(this.props, 'isLoading', false);

  protected formatPrice(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  }
}
