import {css, html, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';

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
      border-radius: 6px;
      background: var(--surface);
      overflow: hidden;
      transition: all 200ms ease;
    }

    .product-card:hover {
      border-color: var(--accent);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }

    .image-container {
      width: 100%;
      aspect-ratio: 1;
      background: var(--bg-1);
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .product-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center;
    }

    .product-image.empty {
      background: var(--bg-1);
    }

    .product-info {
      padding: 0.85rem;
    }

    .product-title {
      margin: 0 0 0.5rem;
      font-size: 0.95rem;
      font-weight: 600;
      color: var(--ink);
      line-height: 1.3;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      word-break: break-word;
    }

    .product-price {
      margin: 0;
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--accent);
    }
  `;

  /** The product image URL. */
  @property({type: String})
  public image = '';

  /** The product title. */
  @property({type: String})
  public title = '';

  /** The product price (formatted string, e.g., "$99.99"). */
  @property({type: String})
  public price = '';

  override render() {
    return html`
      <article class="product-card">
        <div class="image-container" part="image">
          ${this.image
            ? html`<img
                class="product-image"
                src="${this.image}"
                alt="${this.title}"
                loading="lazy"
              />`
            : html`<div class="product-image empty"></div>`}
        </div>
        <div class="product-info">
          <h3 class="product-title" part="title">${this.title}</h3>
          ${this.price
            ? html`<p class="product-price" part="price">${this.price}</p>`
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
