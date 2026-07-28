import {css, html, LitElement, nothing} from 'lit';
import {HeadlessController} from '../controllers/headless-controller.js';
import {baseStyles} from '../shared-styles.js';

/**
 * The header search box shown on non-search pages. It is backed by a
 * `StandaloneSearchBox` controller: submitting (or picking a suggestion) sets
 * `state.redirectTo`, at which point we navigate to the search route and call
 * `afterRedirection()` so the search page runs the query. Its dropdown shows
 * query suggestions and instant products, only while the input is focused, with
 * arrow-key navigation of suggestions.
 */
export class StandaloneSearchBox extends LitElement {
  static properties = {
    focused: {state: true},
    active: {state: true},
  };

  static styles = [
    baseStyles,
    css`
      :host {
        flex: 1 1 280px;
        max-width: 460px;
        margin-left: auto;
      }

      .search-box {
        display: flex;
        gap: 0.5rem;
        align-items: center;
        position: relative;
        margin: 0;
      }

      input {
        flex: 1;
        min-width: 0;
        padding: 0.65rem 0.9rem;
        border: 1px solid var(--border);
        border-radius: var(--radius);
        background: var(--surface);
        box-shadow: var(--shadow-sm);
      }

      .search-box > button {
        background: var(--accent);
        color: var(--accent-contrast);
        border-color: var(--accent);
      }

      .search-box > button:hover:not(:disabled) {
        background: var(--accent-hover);
        border-color: var(--accent-hover);
        color: var(--accent-contrast);
      }

      /* Dropdown: query suggestions on the left, instant products on the right */
      .dropdown {
        position: absolute;
        top: calc(100% + 0.35rem);
        left: 0;
        right: 0;
        z-index: 20;
        display: flex;
        gap: 1rem;
        padding: 0.75rem;
        border: 1px solid var(--border);
        border-radius: var(--radius);
        background: var(--surface);
        box-shadow: var(--shadow);
      }

      .column {
        flex: 1;
        min-width: 0;
      }

      .column-title {
        margin: 0 0 0.4rem;
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--text-muted);
      }

      ul {
        list-style: none;
        margin: 0;
        padding: 0;
      }

      .suggestion {
        display: block;
        width: 100%;
        text-align: left;
        padding: 0.45rem 0.6rem;
        border: none;
        border-radius: var(--radius-sm);
        background: none;
        color: var(--text);
      }

      .suggestion:hover,
      .suggestion.active {
        background: var(--accent-soft);
        color: var(--accent);
      }

      .instant {
        display: flex;
        align-items: center;
        gap: 0.65rem;
        width: 100%;
        padding: 0.4rem;
        border: none;
        border-radius: var(--radius-sm);
        background: none;
        text-align: left;
      }

      .instant:hover {
        background: var(--accent-soft);
      }

      .instant-image {
        flex: none;
        width: 44px;
        height: 44px;
        object-fit: contain;
        background: var(--bg);
        border-radius: var(--radius-sm);
      }

      .instant-info {
        display: flex;
        flex-direction: column;
        min-width: 0;
      }

      .instant-name {
        font-weight: 500;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .instant-price {
        color: var(--text-muted);
        font-size: 0.85rem;
      }
    `,
  ];

  constructor() {
    super();
    this.focused = false;
    this.active = -1;
  }

  connectedCallback() {
    super.connectedCallback();
    if (this.controller && !this.bound) {
      new HeadlessController(this, this.controller);
      new HeadlessController(this, this.instantProducts);
      this.bound = true;
    }
    // Start from an empty box each time it is shown.
    if (this.controller?.state.value) {
      this.controller.clear();
    }
  }

  updated() {
    // On submit/selection the controller asks to redirect. Hand the query off
    // to the search page, then navigate there.
    if (this.controller?.state.redirectTo === '/search') {
      this.controller.afterRedirection();
      window.location.hash = '#/search';
    }
  }

  #onInput(value) {
    this.active = -1;
    if (value === '') {
      this.controller.clear();
      this.instantProducts.updateQuery('');
      return;
    }
    this.controller.updateText(value);
    this.controller.showSuggestions();
    this.instantProducts.updateQuery(value);
  }

  #selectSuggestion(rawValue) {
    this.controller.selectSuggestion(rawValue);
    this.focused = false;
    this.active = -1;
  }

  #onKeydown(e) {
    const suggestions = this.controller.state.suggestions;
    switch (e.key) {
      case 'ArrowDown':
        if (suggestions.length) {
          e.preventDefault();
          this.active = (this.active + 1) % suggestions.length;
        }
        break;
      case 'ArrowUp':
        if (suggestions.length) {
          e.preventDefault();
          this.active = (this.active - 1 + suggestions.length) % suggestions.length;
        }
        break;
      case 'Enter':
        if (this.active >= 0 && suggestions[this.active]) {
          this.#selectSuggestion(suggestions[this.active].rawValue);
        } else {
          this.controller.submit();
          this.focused = false;
        }
        break;
      case 'Escape':
        this.focused = false;
        this.active = -1;
        break;
      default:
        break;
    }
  }

  #onClickInstantProduct(product) {
    this.instantProducts.interactiveProduct({options: {product}}).select();
    window.open(product.clickUri, '_blank', 'noopener,noreferrer');
  }

  #renderDropdown(suggestions, products) {
    if (!suggestions.length && !products.length) {
      return nothing;
    }
    return html`
      <div class="dropdown" @mousedown=${(e) => e.preventDefault()}>
        ${suggestions.length
          ? html`
              <div class="column">
                <p class="column-title">Query suggestions</p>
                <ul>
                  ${suggestions.map(
                    (suggestion, i) => html`
                      <li>
                        <button
                          type="button"
                          class="suggestion ${i === this.active ? 'active' : ''}"
                          @click=${() => this.#selectSuggestion(suggestion.rawValue)}
                        >
                          ${suggestion.rawValue}
                        </button>
                      </li>
                    `
                  )}
                </ul>
              </div>
            `
          : nothing}
        ${products.length
          ? html`
              <div class="column">
                <p class="column-title">Instant products</p>
                <ul>
                  ${products.map(
                    (product) => html`
                      <li>
                        <button
                          type="button"
                          class="instant"
                          @click=${() => this.#onClickInstantProduct(product)}
                        >
                          <img
                            class="instant-image"
                            src=${product.ec_images?.[0] ?? ''}
                            alt=${product.ec_name ?? ''}
                            loading="lazy"
                          />
                          <span class="instant-info">
                            <span class="instant-name"
                              >${product.ec_name ?? product.permanentid}</span
                            >
                            ${product.ec_price == null
                              ? nothing
                              : html`<span class="instant-price">$${product.ec_price}</span>`}
                          </span>
                        </button>
                      </li>
                    `
                  )}
                </ul>
              </div>
            `
          : nothing}
      </div>
    `;
  }

  render() {
    const {value, suggestions} = this.controller?.state ?? {
      value: '',
      suggestions: [],
    };
    const products = value ? (this.instantProducts?.state.products ?? []) : [];

    return html`
      <div class="search-box">
        <input
          type="text"
          placeholder="Search..."
          aria-label="Search"
          .value=${value}
          @input=${(e) => this.#onInput(e.target.value)}
          @focus=${() => (this.focused = true)}
          @blur=${() => (this.focused = false)}
          @keydown=${(e) => this.#onKeydown(e)}
        />
        <button type="button" @click=${() => this.controller.submit()}>Search</button>
        ${this.focused ? this.#renderDropdown(suggestions, products) : nothing}
      </div>
    `;
  }
}

customElements.define('commerce-standalone-search-box', StandaloneSearchBox);
