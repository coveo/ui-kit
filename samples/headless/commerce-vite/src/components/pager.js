import {css, html, LitElement, nothing} from 'lit';
import {HeadlessController} from '../controllers/headless-controller.js';
import {baseStyles} from '../shared-styles.js';

/**
 * Previous/next pager backed by a commerce `Pagination` sub-controller. Hidden
 * when there is a single page of results.
 */
export class Pager extends LitElement {
  static styles = [
    baseStyles,
    css`
      .pager {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: center;
        gap: 0.35rem;
        margin-top: 1rem;
        color: var(--text-muted);
        font-size: 0.9rem;
      }

      .pager button {
        min-width: 2rem;
        height: 2rem;
      }

      .pager span {
        margin: 0 0.25rem;
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
    if (!state || state.totalPages <= 1) {
      return nothing;
    }

    const {page, totalPages} = state;
    return html`
      <div class="pager">
        <button
          type="button"
          ?disabled=${page === 0}
          @click=${() => this.controller.previousPage()}
        >
          Previous
        </button>
        <span>Page ${page + 1} of ${totalPages}</span>
        <button
          type="button"
          ?disabled=${page >= totalPages - 1}
          @click=${() => this.controller.nextPage()}
        >
          Next
        </button>
      </div>
    `;
  }
}

customElements.define('commerce-pager', Pager);
