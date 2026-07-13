import {buildInteractiveResult} from '@coveo/headless';
import {css, html, LitElement, nothing} from 'lit';
import {HeadlessController} from '../controllers/headless-controller.js';
import {engine} from '../engine.js';
import {baseStyles} from '../shared-styles.js';
import {filterProtocol} from '../utils/filter-protocol.js';

/**
 * Renders the search results as cards. Each title link builds an
 * `InteractiveResult` controller so opening a result logs a click analytics
 * event; that usage data powers query suggestions and other Coveo ML models.
 */
export class ResultList extends LitElement {
  static styles = [
    baseStyles,
    css`
      :host {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .result {
        padding: 1rem;
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: var(--radius);
        box-shadow: var(--shadow-sm);
        transition:
          box-shadow 0.15s,
          transform 0.15s;
      }

      .result:hover {
        box-shadow: var(--shadow);
        transform: translateY(-2px);
      }

      .title {
        font-size: 1.05rem;
        font-weight: 600;
        color: var(--accent);
      }

      .title:hover {
        color: var(--accent-hover);
      }

      .excerpt {
        margin: 0.35rem 0 0;
        color: var(--text-muted);
        font-size: 0.9rem;
      }

      .empty {
        color: var(--text-muted);
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

  #select(result) {
    buildInteractiveResult(engine, {options: {result}}).select();
  }

  render() {
    const state = this.controller?.state;
    if (!state) {
      return nothing;
    }
    if (!state.isLoading && state.results.length === 0) {
      return html`<p class="empty">No results found.</p>`;
    }

    return html`
      ${state.results.map(
        (result) => html`
          <article class="result">
            <a
              class="title"
              href=${filterProtocol(result.clickUri)}
              target="_blank"
              rel="noopener noreferrer"
              @click=${() => this.#select(result)}
              @auxclick=${() => this.#select(result)}
              @contextmenu=${() => this.#select(result)}
            >
              ${result.title}
            </a>
            ${result.excerpt
              ? html`<p class="excerpt">${result.excerpt}</p>`
              : nothing}
          </article>
        `
      )}
    `;
  }
}

customElements.define('search-result-list', ResultList);
