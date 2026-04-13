import {CommonModule} from '@angular/common';
import {Component, Input} from '@angular/core';

import type {Product} from '@core/types/commerce.js';

import {CommercePriceDisplayComponent} from './commerce-price-display.component';

export interface ProductSection {
  heading: string;
  products: Product[];
}

@Component({
  selector: 'app-commerce-product-carousel',
  standalone: true,
  imports: [CommonModule, CommercePriceDisplayComponent],
  template: `
    @if (sections.length > 0) {
      <div class="product-carousel">
        @for (section of sections; track section.heading + '-' + $index) {
          <div class="carousel-section">
            @if (isLoading && section.products.length === 0) {
              <h3 class="commerce-heading">{{ section.heading }}</h3>
              <div
                class="carousel-track"
                role="list"
                aria-label="Loading products"
                aria-busy="true"
              >
                @for (item of [1, 2, 3]; track item) {
                  <div role="listitem" class="carousel-track__item">
                    <article class="product-card product-card--skeleton">
                      <div
                        class="product-card__image commerce-loading commerce-loading--image"
                      ></div>
                      <div class="product-card__body">
                        <div
                          class="commerce-loading commerce-loading--line"
                        ></div>
                        <div
                          class="commerce-loading commerce-loading--line commerce-loading--line-wide"
                        ></div>
                      </div>
                    </article>
                  </div>
                }
              </div>
            } @else {
              <h3 class="commerce-heading">{{ section.heading }}</h3>
              <div class="carousel-track" role="list">
                @for (
                  product of section.products;
                  track product.ec_product_id
                ) {
                  <div role="listitem" class="carousel-track__item">
                    <article class="product-card">
                      @if (product.ec_image) {
                        <img
                          [src]="product.ec_image"
                          [alt]="product.ec_name"
                          class="product-card__image"
                        />
                      } @else {
                        <div
                          class="product-card__image product-card__image--placeholder"
                          aria-hidden="true"
                        ></div>
                      }
                      <div class="product-card__body">
                        <p class="product-card__name">{{ product.ec_name }}</p>
                        <p class="product-card__brand">
                          {{ product.ec_brand }}
                        </p>
                        <app-commerce-price-display [product]="product" />
                      </div>
                    </article>
                  </div>
                }
              </div>
            }
          </div>
        }
      </div>
    }
  `,
  styles: [
    `
      .product-carousel {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .carousel-section {
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
      }

      .carousel-track {
        display: flex;
        gap: 0.75rem;
        overflow-x: auto;
        padding-top: 0.4rem;
        padding-bottom: 0.4rem;
        scroll-snap-type: x mandatory;
      }

      .carousel-track::-webkit-scrollbar {
        height: 4px;
      }

      .carousel-track::-webkit-scrollbar-track {
        background: var(--bg-1);
      }

      .carousel-track::-webkit-scrollbar-thumb {
        background: var(--border);
        border-radius: 2px;
      }

      .product-card {
        flex: 0 0 180px;
        border: 2px solid rgba(0, 212, 255, 0.3);
        border-radius: 12px;
        background: linear-gradient(
          135deg,
          rgba(22, 45, 66, 0.6) 0%,
          rgba(26, 58, 82, 0.4) 100%
        );
        overflow: hidden;
        scroll-snap-align: start;
        transition: all 0.3s ease;
        box-shadow: 0 0 15px rgba(0, 212, 255, 0.1);
        backdrop-filter: blur(5px);
      }

      .product-card:hover {
        border-color: rgba(0, 212, 255, 0.6);
        box-shadow: 0 0 30px rgba(0, 212, 255, 0.25);
        transform: translateY(-4px);
      }

      .carousel-track__item {
        flex: 0 0 180px;
        min-width: 180px;
      }

      .product-card__image--placeholder {
        background: linear-gradient(
          45deg,
          rgba(0, 212, 255, 0.1),
          rgba(0, 212, 255, 0.05)
        );
      }

      .product-card__image {
        width: 100%;
        height: 110px;
        object-fit: cover;
        display: block;
        border-bottom: 1px solid rgba(0, 212, 255, 0.2);
      }

      .product-card--skeleton .product-card__body {
        gap: 0.45rem;
      }

      .product-card__body {
        padding: 0.5rem 0.65rem;
        display: flex;
        flex-direction: column;
        gap: 0.2rem;
      }

      .product-card__name {
        margin: 0;
        font-size: 0.8rem;
        font-weight: 600;
        color: var(--ink);
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .product-card__brand {
        margin: 0;
        font-size: 0.75rem;
        color: var(--ink-muted);
      }
    `,
  ],
})
export class CommerceProductCarouselComponent {
  @Input() sections: ProductSection[] = [];
  @Input() isLoading = false;
}
