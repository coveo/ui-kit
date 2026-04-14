import {customElement, property} from 'lit/decorators.js';
import {css, html, LitElement, nothing} from 'lit';
import {map} from 'lit/directives/map.js';
import {when} from 'lit/directives/when.js';
import type {Product} from '@coveo/commerce-agent-chat-core/types/commerce';
import './cac-price-display.js';

export interface ProductSection {
  heading: string;
  products: Product[];
}

/**
 * The `cac-product-carousel` component renders product cards grouped in sections.
 */
@customElement('cac-product-carousel')
export class CacProductCarousel extends LitElement {
  static override styles = css`
    :host {
      display: block;
      width: 100%;
    }

    .product-carousel {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      width: 100%;
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

    .carousel-track__item {
      flex: 0 0 180px;
      min-width: 180px;
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

    .product-card__image {
      width: 100%;
      height: 110px;
      object-fit: cover;
      display: block;
      border-bottom: 1px solid rgba(0, 212, 255, 0.2);
    }

    .product-card__image--placeholder {
      background: linear-gradient(
        45deg,
        rgba(0, 212, 255, 0.1),
        rgba(0, 212, 255, 0.05)
      );
    }

    .commerce-loading {
      border-radius: 6px;
      background: linear-gradient(
        90deg,
        rgba(26, 77, 109, 0.4) 25%,
        rgba(0, 212, 255, 0.15) 50%,
        rgba(26, 77, 109, 0.4) 75%
      );
      background-size: 600px 100%;
      animation: shimmer 1.4s infinite linear;
    }

    .commerce-loading--line {
      height: 12px;
      width: 45%;
    }

    .commerce-loading--line-wide {
      width: 70%;
    }

    .commerce-loading--image {
      width: 100%;
      height: 90px;
    }

    .commerce-loading--heading {
      display: block;
      height: 1em;
      width: min(16rem, 55%);
      border-radius: 8px;
    }

    @keyframes shimmer {
      0% {
        background-position: -600px 0;
      }
      100% {
        background-position: 600px 0;
      }
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
      font-size: 0.72rem;
      color: var(--ink-muted);
    }
  `;

  /** The sections with headings and products to render. */
  @property({attribute: false})
  public sections: ProductSection[] = [];

  /** Whether loading placeholders should be shown when sections are empty. */
  @property({type: Boolean, attribute: 'is-loading'})
  public isLoading = false;

  override render() {
    if (this.sections.length === 0) {
      return nothing;
    }

    return html` <div class="product-carousel">${this.renderSections()}</div> `;
  }

  private renderSections() {
    return map(this.sections, (section, index) =>
      this.renderSection(section, `${section.heading}-${index}`)
    );
  }

  private renderSection(section: ProductSection, key: string) {
    if (this.isLoading && section.products.length === 0) {
      return this.renderLoadingSection(section, key);
    }

    return this.renderProductsSection(section, key);
  }

  private renderLoadingSection(section: ProductSection, key: string) {
    return html`
      <div class="carousel-section" aria-busy="true" data-key=${key}>
        <h3 class="commerce-heading" aria-hidden="true">
          <span class="commerce-loading commerce-loading--heading"></span>
        </h3>
        <div class="carousel-track" role="list" aria-label="Loading products">
          ${this.renderLoadingCards()}
        </div>
      </div>
    `;
  }

  private renderLoadingCards() {
    return Array.from({length: 4}, () => this.renderLoadingCard());
  }

  private renderLoadingCard() {
    return html`
      <div role="listitem" class="carousel-track__item">
        <div class="product-card product-card--skeleton">
          <div
            class="product-card__image commerce-loading commerce-loading--image"
          ></div>
          <div class="product-card__body">
            <div class="commerce-loading commerce-loading--line"></div>
            <div
              class="commerce-loading commerce-loading--line commerce-loading--line-wide"
            ></div>
          </div>
        </div>
      </div>
    `;
  }

  private renderProductsSection(section: ProductSection, key: string) {
    return html`
      <div class="carousel-section" data-key=${key}>
        <h3 class="commerce-heading">${section.heading}</h3>
        <div class="carousel-track" role="list">
          ${this.renderProductCards(section.products)}
        </div>
      </div>
    `;
  }

  private renderProductCards(products: Product[]) {
    return map(products, (product) => this.renderProductCard(product));
  }

  private renderProductCard(product: Product) {
    return html`
      <div role="listitem" class="carousel-track__item">
        <article class="product-card">
          ${this.renderProductImage(product)}
          <div class="product-card__body">
            <p class="product-card__name">${product.ec_name}</p>
            <p class="product-card__brand">${product.ec_brand}</p>
            <cac-price-display .product=${product}></cac-price-display>
          </div>
        </article>
      </div>
    `;
  }

  private renderProductImage(product: Product) {
    return when(
      Boolean(product.ec_image),
      () => html`
        <img
          src=${product.ec_image}
          alt=${product.ec_name}
          class="product-card__image"
        />
      `,
      () => html`
        <div
          class="product-card__image product-card__image--placeholder"
          aria-hidden="true"
        ></div>
      `
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'cac-product-carousel': CacProductCarousel;
  }
}
