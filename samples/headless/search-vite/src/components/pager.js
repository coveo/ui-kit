import {css, html, LitElement, nothing} from 'lit';
import {HeadlessController} from '../controllers/headless-controller.js';
import {baseStyles} from '../shared-styles.js';

/** Numbered pager backed by a Headless `Pager` controller. */
export class Pager extends LitElement {
  static styles = [
    baseStyles,
    css`
      .pager {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 0.35rem;
        margin-top: 1.5rem;
      }

      button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 2rem;
        height: 2rem;
        padding: 0 0.5rem;
      }

      button.active {
        background: var(--accent);
        border-color: var(--accent);
        color: var(--accent-contrast);
        font-weight: 600;
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
    const state = this.controller?.state;
    if (!state || state.currentPages.length === 0) {
      return nothing;
    }
    const {currentPages, currentPage, hasPreviousPage, hasNextPage} = state;

    return html`
      <div class="pager">
        <button
          type="button"
          ?disabled=${!hasPreviousPage}
          @click=${() => this.controller.previousPage()}
        >
          ‹ Prev
        </button>
        ${currentPages.map(
          (page) => html`
            <button
              type="button"
              class=${page === currentPage ? 'active' : ''}
              @click=${() => this.controller.selectPage(page)}
            >
              ${page}
            </button>
          `
        )}
        <button
          type="button"
          ?disabled=${!hasNextPage}
          @click=${() => this.controller.nextPage()}
        >
          Next ›
        </button>
      </div>
    `;
  }
}

customElements.define('search-pager', Pager);
