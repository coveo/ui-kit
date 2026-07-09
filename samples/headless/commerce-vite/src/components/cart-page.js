import {buildContext, buildRecommendations} from '@coveo/headless/commerce';
import {css, html, LitElement} from 'lit';
import {HeadlessController} from '../controllers/headless-controller.js';
import {engine} from '../engine.js';
import {baseStyles, headingStyles} from '../shared-styles.js';
import './product-list.js';

/**
 * Cart page: lists the items in the cart with quantity controls, a total, and
 * purchase/empty actions, plus a recommendations slot. It subscribes to the
 * `Cart` controller passed from the app shell.
 */
export class CartPage extends LitElement {
  static styles = [
    baseStyles,
    headingStyles,
    css`
      h1 {
        font-size: 1.35rem;
        margin: 0 0 1rem;
      }

      .muted {
        color: var(--text-muted);
      }

      .items {
        list-style: none;
        margin: 0 0 1rem;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .item {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 0.5rem;
        padding: 0.85rem 1rem;
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: var(--radius);
        box-shadow: var(--shadow-sm);
      }

      .item-name {
        font-weight: 600;
      }

      .item-meta {
        color: var(--text-muted);
        font-size: 0.9rem;
      }

      .actions {
        display: flex;
        gap: 0.35rem;
      }

      .summary {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 2rem;
      }

      .total {
        font-weight: 600;
        margin-right: auto;
      }

      .purchase {
        background: var(--accent);
        color: var(--accent-contrast);
        border-color: var(--accent);
      }

      .purchase:hover:not(:disabled) {
        background: var(--accent-hover);
        border-color: var(--accent-hover);
        color: var(--accent-contrast);
      }
    `,
  ];

  constructor() {
    super();
    buildContext(engine).setView({url: 'https://sports.barca.group/cart'});
    this.recommendations = buildRecommendations(engine, {
      options: {slotId: 'd8118c04-ff59-4f03-baca-2fc5f3b81221'},
    });
  }

  connectedCallback() {
    super.connectedCallback();
    if (this.cart && !this.bound) {
      new HeadlessController(this, this.cart);
      this.bound = true;
    }
  }

  firstUpdated() {
    this.recommendations.refresh();
  }

  #adjust(item, delta) {
    this.cart.updateItemQuantity({...item, quantity: item.quantity + delta});
  }

  #purchase() {
    this.cart.purchase({
      id: crypto.randomUUID(),
      revenue: this.cart.state.totalPrice,
    });
  }

  render() {
    const state = this.cart?.state ?? {items: [], totalPrice: 0};
    const isEmpty = state.items.length === 0;

    return html`
      <h1>Cart</h1>
      ${isEmpty
        ? html`<p class="muted">Your cart is empty.</p>`
        : html`
            <ul class="items">
              ${state.items.map(
                (item) => html`
                  <li class="item">
                    <div>
                      <div class="item-name">${item.name}</div>
                      <div class="item-meta">
                        $${item.price} × ${item.quantity} =
                        $${(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                    <div class="actions">
                      <button
                        type="button"
                        @click=${() => this.#adjust(item, 1)}
                      >
                        Add one
                      </button>
                      <button
                        type="button"
                        @click=${() => this.#adjust(item, -1)}
                      >
                        Remove one
                      </button>
                      <button
                        type="button"
                        @click=${() => this.#adjust(item, -item.quantity)}
                      >
                        Remove all
                      </button>
                    </div>
                  </li>
                `
              )}
            </ul>
            <div class="summary">
              <span class="total">Total: $${state.totalPrice.toFixed(2)}</span>
              <button
                type="button"
                class="purchase"
                @click=${() => this.#purchase()}
              >
                Purchase
              </button>
              <button type="button" @click=${() => this.cart.empty()}>
                Empty cart
              </button>
            </div>
          `}

      <section>
        <h2>Recommended for you</h2>
        <commerce-product-list
          .controller=${this.recommendations}
          .cart=${this.cart}
        ></commerce-product-list>
      </section>
    `;
  }
}

customElements.define('commerce-cart-page', CartPage);
