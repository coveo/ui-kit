import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import {ProductCarouselSurface} from '../models';
import {
  ProductCardComponent,
  type ProductCardData,
} from './product-card.component';

@Component({
  selector: 'app-product-carousel',
  imports: [ProductCardComponent],
  template: `
    <section class="surface">
      <header class="surface-header">
        <p class="surface-kicker">Product Carousel</p>
        <h3>{{ surface().heading }}</h3>
      </header>

      @if (surface().isLoading || surface().products.length === 0) {
        <div class="loading-grid">
          @for (item of placeholders; track $index) {
            <div class="loading-card"></div>
          }
        </div>
      } @else {
        <div class="carousel">
          @for (card of cards(); track card.id) {
            <app-product-card class="carousel-item" [product]="card" />
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

      .carousel,
      .loading-grid {
        display: flex;
        gap: 14px;
        overflow-x: auto;
        scroll-snap-type: x mandatory;
        padding-bottom: 8px;
      }

      .carousel-item {
        flex: 0 0 240px;
        scroll-snap-align: start;
      }

      .loading-card {
        flex: 0 0 240px;
        scroll-snap-align: start;
        min-height: 220px;
        border-radius: 22px;
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
export class ProductCarouselComponent {
  protected readonly placeholders = Array.from({length: 3});
  readonly surface = input.required<ProductCarouselSurface>();

  protected readonly cards = computed<ProductCardData[]>(() =>
    this.surface().products.map((p) => ({
      id: p.ec_product_id,
      name: p.ec_name,
      brand: p.ec_brand,
      image: p.ec_image,
      price: p.ec_price,
      promoPrice: p.ec_promo_price,
      description: p.description,
      accent: p.accent,
    }))
  );
}
