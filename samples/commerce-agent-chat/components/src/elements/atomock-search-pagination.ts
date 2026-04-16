import {css, html, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';

/**
 * The `atomock-search-pagination` component displays a "Load More" button
 * for paginated search results. Emits `load-more` event when clicked.
 *
 * @event load-more - Fired when the load-more button is clicked; indicates user requests next page
 */
@customElement('atomock-search-pagination')
export class AtomockSearchPagination extends LitElement {
  static override styles = css`
    :host {
      display: block;
      width: 100%;
      margin-top: 1.5rem;
      padding-bottom: 1rem;
    }

    .pagination-container {
      display: flex;
      justify-content: center;
      gap: 0.75rem;
    }

    .load-more-button {
      padding: 0.65rem 1.5rem;
      font-size: 0.95rem;
      font-weight: 600;
      color: #fff;
      background: var(--accent);
      border: 1px solid var(--accent);
      border-radius: 6px;
      cursor: pointer;
      transition: all 200ms ease;
    }

    .load-more-button:hover:not(:disabled) {
      background: #0b5ac9;
      border-color: #0b5ac9;
      box-shadow: 0 2px 8px rgba(19, 114, 236, 0.2);
    }

    .load-more-button:active:not(:disabled) {
      transform: scale(0.98);
    }

    .load-more-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .spinner {
      display: inline-block;
      width: 1em;
      height: 1em;
      margin-right: 0.5rem;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      vertical-align: -0.125em;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
  `;

  /** Whether there are more results available to load. */
  @property({type: Boolean, attribute: 'has-more'})
  public hasMore = false;

  /** Whether a load request is currently in flight. */
  @property({type: Boolean})
  public loading = false;

  override render() {
    if (!this.hasMore) {
      return html``;
    }

    return html`
      <div class="pagination-container">
        <button
          class="load-more-button"
          ?disabled="${this.loading}"
          @click="${this.handleLoadMore}"
        >
          ${this.loading
            ? html`<span class="spinner"></span>Loading...`
            : 'Load More Results'}
        </button>
      </div>
    `;
  }

  private handleLoadMore(): void {
    this.dispatchEvent(
      new CustomEvent('load-more', {
        bubbles: true,
        composed: true,
      })
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomock-search-pagination': AtomockSearchPagination;
  }
}
