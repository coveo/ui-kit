import {customElement, property} from 'lit/decorators.js';
import {css, html, LitElement, nothing} from 'lit';
import {map} from 'lit/directives/map.js';
import type {Product} from '@coveo/commerce-agent-chat-core/types/commerce';
import './atomock-product-image.js';
import './atomock-product-link.js';
import './atomock-product-price.js';
import './atomock-product-text.js';

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
      background: #eef2f7;
    }

    .carousel-track::-webkit-scrollbar-thumb {
      background: #b8c2d1;
      border-radius: 2px;
    }

    .carousel-track__item {
      flex: 0 0 180px;
      min-width: 180px;
    }

    .product-card {
      flex: 0 0 180px;
      border: 1px solid var(--border);
      border-radius: 10px;
      background: #fff;
      overflow: hidden;
      scroll-snap-align: start;
      transition: all 0.3s ease;
      box-shadow: 0 1px 4px rgba(15, 23, 42, 0.08);
    }

    .product-card:hover {
      border-color: #b8c7dd;
    }

    .product-image {
      width: 100%;
      height: 110px;
      display: block;
      border-bottom: 1px solid #e2e8f0;
      --atomock-product-image-placeholder-bg: #edf1f7;
    }

    .commerce-loading {
      border-radius: 6px;
      background: linear-gradient(
        90deg,
        rgba(208, 215, 226, 0.65) 25%,
        rgba(228, 233, 241, 0.9) 50%,
        rgba(208, 215, 226, 0.65) 75%
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

    .product-name {
      --atomock-product-link-font-size: 0.8rem;
      --atomock-product-link-font-weight: 600;
      --atomock-product-link-color: var(--ink);
      --atomock-product-link-lines: 2;
    }

    .product-brand {
      --atomock-product-text-font-size: 0.72rem;
      --atomock-product-text-color: var(--ink-muted);
      --atomock-product-text-lines: 2;
    }

    .product-price {
      --atomock-product-price-font-size: 0.9rem;
      --atomock-product-price-color: var(--ink);
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
          <atomock-product-image
            class="product-image"
            .src=${product.ec_image}
            .alt=${product.ec_name}
          ></atomock-product-image>
          <div class="product-card__body">
            <atomock-product-link
              class="product-name"
              .text=${product.ec_name}
              .href=${this.getProductHref(product)}
            ></atomock-product-link>
            <atomock-product-text
              class="product-brand"
              .text=${product.ec_brand}
            ></atomock-product-text>
            <atomock-product-price
              class="product-price"
              .product=${product}
            ></atomock-product-price>
          </div>
        </article>
      </div>
    `;
  }

  private getProductHref(product: Product) {
    const candidate =
      product['clickUri'] ?? product['ec_product_url'] ?? product['url'];
    return typeof candidate === 'string' ? candidate : '';
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'cac-product-carousel': CacProductCarousel;
  }
}
