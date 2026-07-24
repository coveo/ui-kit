import {buildInteractiveInstantResult} from '@coveo/headless';
import {css, html, LitElement, nothing} from 'lit';
import {HeadlessController} from '../controllers/headless-controller.js';
import {engine} from '../engine.js';
import {baseStyles} from '../shared-styles.js';

/**
 * Centered search box with query suggestions and instant results. The
 * `controller` (SearchBox) drives the value/suggestions; the `instantResults`
 * controller returns the top results for the current query (its `searchBoxId`
 * matches the search box's `id`). The dropdown is only shown while the input is
 * focused and hides when the user clicks away.
 */
export class SearchBox extends LitElement {
  static properties = {
    // Internal reactive state: whether the input is focused (controls the dropdown).
    focused: {state: true},
    // Index of the arrow-key-highlighted suggestion (-1 = none).
    active: {state: true},
  };

  static styles = [
    baseStyles,
    css`
      .search-box {
        position: relative;
        max-width: 820px;
        margin: 0 auto 1.75rem;
      }

      input {
        width: 100%;
        padding: 0.65rem 0.9rem;
        font-size: 1rem;
        border: 1px solid var(--border);
        border-radius: var(--radius);
        background: var(--surface);
        box-shadow: var(--shadow-sm);
        outline: none;
      }

      .dropdown {
        position: absolute;
        z-index: 20;
        left: 0;
        right: 0;
        top: calc(100% + 0.35rem);
        display: flex;
        gap: 1rem;
        padding: 0.75rem;
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: var(--radius);
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

      li {
        list-style: none;
      }

      .suggestion {
        width: 100%;
        text-align: left;
        padding: 0.45rem 0.6rem;
        border: 0;
        background: none;
        border-radius: var(--radius-sm);
        color: var(--text);
      }

      .suggestion:hover {
        background: var(--accent-soft);
      }

      .suggestion.active {
        background: var(--accent-soft);
        color: var(--accent);
      }

      .instant {
        display: block;
        padding: 0.45rem 0.6rem;
        border-radius: var(--radius-sm);
        color: var(--text);
        text-decoration: none;
      }

      .instant:hover {
        background: var(--accent-soft);
        text-decoration: none;
      }

      .instant-title {
        display: block;
        font-weight: 500;
        color: var(--accent);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .instant-excerpt {
        display: block;
        font-size: 0.8rem;
        color: var(--text-muted);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
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
      new HeadlessController(this, this.instantResults);
      this.bound = true;
    }
  }

  #onInput(value) {
    this.active = -1;
    this.controller.updateText(value);
    this.instantResults?.updateQuery(value);
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

  #selectSuggestion(rawValue) {
    this.controller.selectSuggestion(rawValue);
    this.focused = false;
    this.active = -1;
  }

  #selectInstant(result) {
    buildInteractiveInstantResult(engine, {options: {result}}).select();
    this.focused = false;
  }

  render() {
    const {value, suggestions} = this.controller?.state ?? {
      value: '',
      suggestions: [],
    };
    const results = value ? (this.instantResults?.state.results ?? []) : [];
    const showDropdown = this.focused && value && (suggestions.length || results.length);

    return html`
      <div class="search-box">
        <input
          type="search"
          placeholder="Search..."
          aria-label="Search"
          .value=${value}
          @input=${(e) => this.#onInput(e.target.value)}
          @focus=${() => (this.focused = true)}
          @blur=${() => (this.focused = false)}
          @keydown=${(e) => this.#onKeydown(e)}
        />
        ${showDropdown
          ? html`
              <div class="dropdown" @mousedown=${(e) => e.preventDefault()}>
                ${suggestions.length
                  ? html`
                      <div class="column">
                        <p class="column-title">Suggestions</p>
                        <ul role="listbox">
                          ${suggestions.map(
                            (suggestion, i) => html`
                              <li role="presentation">
                                <button
                                  type="button"
                                  role="option"
                                  class="suggestion ${i === this.active ? 'active' : ''}"
                                  aria-selected=${i === this.active}
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
                ${results.length
                  ? html`
                      <div class="column">
                        <p class="column-title">Instant results</p>
                        <ul>
                          ${results.map(
                            (result) => html`
                              <li>
                                <a
                                  class="instant"
                                  href=${result.clickUri}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  @click=${() => this.#selectInstant(result)}
                                  @auxclick=${() => this.#selectInstant(result)}
                                  @contextmenu=${() => this.#selectInstant(result)}
                                >
                                  <span class="instant-title">${result.title}</span>
                                  ${result.excerpt
                                    ? html`<span class="instant-excerpt">${result.excerpt}</span>`
                                    : nothing}
                                </a>
                              </li>
                            `
                          )}
                        </ul>
                      </div>
                    `
                  : nothing}
              </div>
            `
          : nothing}
      </div>
    `;
  }
}

customElements.define('search-box', SearchBox);
