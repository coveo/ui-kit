import {css, html, LitElement} from 'lit';
import {HeadlessController} from '../controllers/headless-controller.js';
import {baseStyles} from '../shared-styles.js';
import './product-card.js';

/**
 * Renders a responsive grid of {@link ProductCard}s from any commerce controller
 * that exposes `state.products` and `interactiveProduct` (Search,
 * ProductListing, or Recommendations). It subscribes to that controller so it
 * re-renders on its own whenever the product set changes.
 */
export class ProductList extends LitElement {
  static styles = [
    baseStyles,
    css`
      .product-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
        gap: 1.1rem;
      }
    `,
  ];

  connectedCallback() {
    super.connectedCallback();
    if (this.controller && !this.bound) {
      new HeadlessController(this, this.controller);
      this.bound = true;
    }
  }

  render() {
    const products = this.controller?.state.products ?? [];
    return html`
      <div class="product-grid">
        ${products.map(
          (product) => html`
            <commerce-product-card
              .product=${product}
              .interactiveProduct=${this.controller.interactiveProduct({
                options: {product},
              })}
              .cart=${this.cart}
            ></commerce-product-card>
          `
        )}
      </div>
    `;
  }
}

customElements.define('commerce-product-list', ProductList);
