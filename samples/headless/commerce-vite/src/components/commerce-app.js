import {
  buildCart,
  buildInstantProducts,
  buildStandaloneSearchBox,
} from '@coveo/headless/commerce';
import {css, html, LitElement, nothing} from 'lit';
import {saveCartItemsToLocalStorage} from '../cart-utils.js';
import {HeadlessController} from '../controllers/headless-controller.js';
import {engine} from '../engine.js';
import {baseStyles, headingStyles} from '../shared-styles.js';
import './cart-page.js';
import './home-page.js';
import './listing-page.js';
import './search-page.js';
import './standalone-search-box.js';

/**
 * Application shell: brand header, pill-tab navigation, and a tiny hash router.
 * Changing the hash swaps the active page element; because each page owns its
 * Headless controllers, unmounting a page (via Lit removing the element) tears
 * down its subscriptions automatically.
 */
export class CommerceApp extends LitElement {
  static properties = {
    route: {attribute: false},
  };

  static styles = [
    baseStyles,
    headingStyles,
    css`
      :host {
        min-height: 100vh;
      }

      .Header {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 0.75rem 1.5rem;
        padding: 0.9rem 1.5rem;
        background: var(--surface);
        border-bottom: 1px solid var(--border);
        box-shadow: var(--shadow-sm);
      }

      /* Brand + nav grouped on the left */
      .HeaderStart {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.75rem 1.5rem;
      }

      .HeaderBrand {
        display: flex;
        align-items: center;
        gap: 0.6rem;
      }

      .HeaderLogo {
        height: 30px;
      }

      .AppTitle {
        font-size: 1.35rem;
        margin: 0;
        white-space: nowrap;
      }

      nav {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.35rem;
      }

      nav a {
        padding: 0.4rem 0.85rem;
        border-radius: 999px;
        color: var(--text-muted);
      }

      nav a:hover {
        background: var(--accent-soft);
        color: var(--accent);
        text-decoration: none;
      }

      nav a[aria-current='page'] {
        background: var(--accent);
        color: var(--accent-contrast);
        font-weight: 600;
      }

      main {
        display: block;
        max-width: 1240px;
        margin: 0 auto;
        padding: 1.5rem;
      }
    `,
  ];

  constructor() {
    super();
    this.route = window.location.hash || '#/';
    this.standaloneSearchBox = buildStandaloneSearchBox(engine, {
      options: {redirectionUrl: '/search', id: 'standalone-search-box'},
    });
    this.instantProducts = buildInstantProducts(engine, {
      options: {searchBoxId: 'standalone-search-box'},
    });
    this.cart = buildCart(engine);
    // Persist the cart on every change so it survives a reload (see engine.js),
    // and re-render the app so the cart tab count stays current.
    this.cart.subscribe(() => saveCartItemsToLocalStorage(this.cart.state));
    new HeadlessController(this, this.cart);
    this.onHashChange = () => {
      this.route = window.location.hash || '#/';
    };
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('hashchange', this.onHashChange);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('hashchange', this.onHashChange);
  }

  #isActive(href) {
    if (href === '#/search') {
      return this.route.startsWith('#/search');
    }
    if (href === '#/listing') {
      return this.route.startsWith('#/listing');
    }
    if (href === '#/cart') {
      return this.route.startsWith('#/cart');
    }
    return (
      !this.route.startsWith('#/search') &&
      !this.route.startsWith('#/listing') &&
      !this.route.startsWith('#/cart')
    );
  }

  #tab(href, label) {
    return html`<a
      href=${href}
      aria-current=${this.#isActive(href) ? 'page' : nothing}
    >
      ${label}
    </a>`;
  }

  #renderPage() {
    if (this.route.startsWith('#/search')) {
      return html`<commerce-search-page
        .cart=${this.cart}
      ></commerce-search-page>`;
    }
    if (this.route.startsWith('#/listing')) {
      return html`<commerce-listing-page
        .cart=${this.cart}
      ></commerce-listing-page>`;
    }
    if (this.route.startsWith('#/cart')) {
      return html`<commerce-cart-page .cart=${this.cart}></commerce-cart-page>`;
    }
    return html`<commerce-home-page .cart=${this.cart}></commerce-home-page>`;
  }

  render() {
    return html`
      <section class="Header">
        <div class="HeaderStart">
          <div class="HeaderBrand">
            <img class="HeaderLogo" src="/coveo-logo.svg" alt="Coveo" />
            <h1 class="AppTitle">Headless Commerce + Vite</h1>
          </div>
          <nav aria-label="Primary">
            ${this.#tab('#/', 'Home')} ${this.#tab('#/search', 'Search')}
            ${this.#tab('#/listing', 'Surf Accessories')}
            ${this.#tab('#/cart', `Cart (${this.cart.state.totalQuantity})`)}
          </nav>
        </div>
        ${this.route.startsWith('#/search')
          ? nothing
          : html`<commerce-standalone-search-box
              .controller=${this.standaloneSearchBox}
              .instantProducts=${this.instantProducts}
            ></commerce-standalone-search-box>`}
      </section>
      <main>${this.#renderPage()}</main>
    `;
  }
}

customElements.define('commerce-app', CommerceApp);
