import {css, html, LitElement, nothing} from 'lit';
import {HeadlessController} from '../controllers/headless-controller.js';
import {baseStyles} from '../shared-styles.js';

/**
 * Presentational card for a single product. Its title links to the product and
 * logs a product-click analytics event through the provided interactive product
 * controller. If a `cart` controller is provided, it also renders add/remove
 * controls and reflects the quantity currently in the cart.
 */
export class ProductCard extends LitElement {
  static properties = {
    product: {attribute: false},
    interactiveProduct: {attribute: false},
  };

  static styles = [
    baseStyles,
    css`
      :host {
        height: 100%;
      }

      .product {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        height: 100%;
        min-width: 0;
        padding: 1rem;
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: var(--radius);
        box-shadow: var(--shadow-sm);
        transition:
          box-shadow 0.15s,
          transform 0.15s;
      }

      .product:hover {
        box-shadow: var(--shadow);
        transform: translateY(-2px);
      }

      .image {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 180px;
        background: var(--bg);
        border-radius: var(--radius-sm);
        overflow: hidden;
      }

      .image img {
        height: 160px;
        width: auto;
        max-width: 100%;
        object-fit: contain;
      }

      .name {
        font-weight: 600;
        color: var(--accent);
      }

      .name:hover {
        color: var(--accent-hover);
        text-decoration: none;
      }

      .price {
        margin: 0;
        font-weight: 600;
      }

      .cart-controls {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.4rem;
        margin-top: auto;
        padding-top: 0.6rem;
        border-top: 1px solid var(--border);
      }

      .in-cart {
        margin: 0;
        color: var(--text-muted);
        font-size: 0.85rem;
      }

      .add {
        background: var(--accent);
        color: var(--accent-contrast);
        border-color: var(--accent);
      }

      .add:hover:not(:disabled) {
        background: var(--accent-hover);
        border-color: var(--accent-hover);
        color: var(--accent-contrast);
      }
    `,
  ];

  connectedCallback() {
    super.connectedCallback();
    if (this.cart && !this.cartBound) {
      new HeadlessController(this, this.cart);
      this.cartBound = true;
    }
  }

  #select() {
    this.interactiveProduct?.select();
  }

  #quantityInCart() {
    const id = this.product.ec_product_id ?? this.product.permanentid;
    return (
      this.cart?.state.items.find((item) => item.productId === id)?.quantity ??
      0
    );
  }

  #adjustQuantity(delta) {
    const product = this.product;
    this.cart.updateItemQuantity({
      name: product.ec_name ?? product.permanentid,
      price: product.ec_promo_price ?? product.ec_price ?? Number.NaN,
      productId: product.ec_product_id ?? product.permanentid,
      quantity: this.#quantityInCart() + delta,
    });
  }

  render() {
    const product = this.product;
    if (!product) {
      return nothing;
    }

    const image = product.ec_images?.[0];
    const price = product.ec_price;
    const quantity = this.#quantityInCart();

    return html`
      <article class="product">
        ${image
          ? html`<div class="image">
              <img src=${image} alt=${product.ec_name ?? ''} loading="lazy" />
            </div>`
          : nothing}
        <a
          class="name"
          href=${product.clickUri}
          target="_blank"
          rel="noopener noreferrer"
          @click=${() => this.#select()}
          @auxclick=${() => this.#select()}
          @contextmenu=${() => this.#select()}
        >
          ${product.ec_name ?? product.permanentid}
        </a>
        ${price == null ? nothing : html`<p class="price">$${price}</p>`}
        ${this.cart
          ? html`
              <div class="cart-controls">
                <button
                  type="button"
                  class="add"
                  @click=${() => this.#adjustQuantity(1)}
                >
                  Add to cart
                </button>
                ${quantity > 0
                  ? html`<span class="in-cart">In cart: ${quantity}</span>`
                  : nothing}
              </div>
            `
          : nothing}
      </article>
    `;
  }
}

customElements.define('commerce-product-card', ProductCard);
