import {css, html, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import './atomock-product-image.js';
import './atomock-product-link.js';
import './atomock-product-price.js';

/**
 * The `atomock-search-product-card` component displays a minimal product card
 * for search results. Mimics Atomic component styling but uses Zustand store instead of Headless.
 *
 * @part image - Product image container
 * @part title - Product title
 * @part price - Product price
 */
@customElement('atomock-search-product-card')
export class AtomockSearchProductCard extends LitElement {
  static override styles = css`
    :host {
      display: block;
      width: 100%;
    }

    .product-card {
      border: 1px solid var(--border);
      border-radius: 10px;
      background: #fff;
      overflow: hidden;
      transition: all 0.3s ease;
      box-shadow: 0 1px 4px rgba(15, 23, 42, 0.08);
    }

    .product-card:hover {
      border-color: #b8c7dd;
    }

    .image-container {
      width: 100%;
      height: 110px;
      overflow: hidden;
      border-bottom: 1px solid #e2e8f0;
    }

    .product-image {
      width: 100%;
      height: 100%;
      --atomock-product-image-placeholder-bg: #edf1f7;
    }

    .product-info {
      padding: 0.5rem 0.65rem;
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
    }

    .product-title {
      --atomock-product-link-font-size: 0.8rem;
      --atomock-product-link-font-weight: 600;
      --atomock-product-link-color: var(--ink);
      --atomock-product-link-line-height: 1.25;
      --atomock-product-link-lines: 2;
    }

    .product-price {
      --atomock-product-price-font-size: 0.9rem;
      --atomock-product-price-font-weight: 700;
      --atomock-product-price-color: var(--ink);
    }
  `;

  /** The product image URL. */
  @property({type: String})
  public image = '';

  /** The product title. */
  @property({type: String})
  public override title = '';

  /** The product price (formatted string, e.g., "$99.99"). */
  @property({type: String})
  public price = '';

  override render() {
    return html`
      <article class="product-card">
        <div class="image-container" part="image">
          <atomock-product-image
            class="product-image"
            .src=${this.image}
            .alt=${this.title}
          ></atomock-product-image>
        </div>
        <div class="product-info">
          <atomock-product-link
            class="product-title"
            part="title"
            .text=${this.title}
          ></atomock-product-link>
          ${this.price
            ? html`<atomock-product-price
                class="product-price"
                part="price"
                .value=${this.price}
              ></atomock-product-price>`
            : ''}
        </div>
      </article>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomock-search-product-card': AtomockSearchProductCard;
  }
}
