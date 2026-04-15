import {css, html, LitElement} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {repeat} from 'lit/directives/repeat.js';
import {when} from 'lit/directives/when.js';
import type {
  SearchResult,
  SearchResultsState,
} from '@coveo/commerce-agent-chat-core/lib/chatStore';
// This import will be provided by the React wrapper when using the component in React context
// For Lit, we expect the parent React component to pass the state as a property

/**
 * The `atomock-search-results` component displays a paginated list of search results.
 * Reads search state from properties (passed by React component wrapper) and emits events
 * for pagination. Mimics Atomic component structure but integrates with Zustand via React props.
 *
 * @part results-container - Container of all product cards
 * @part loading-spinner - Loading indicator element
 * @part empty-state - Empty state message
 * @part error-message - Error message element
 * @event load-more - Fired from atomock-search-pagination when user requests next page
 */
@customElement('atomock-search-results')
export class AtomockSearchResults extends LitElement {
  static override styles = css`
    :host {
      display: block;
      width: 100%;
    }

    .results-wrapper {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      width: 100%;
    }

    .results-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
      gap: 1rem;
      width: 100%;
    }

    @media (min-width: 640px) {
      .results-grid {
        grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      }
    }

    @media (min-width: 1024px) {
      .results-grid {
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      }
    }

    .loading-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 200px;
      gap: 1rem;
    }

    .spinner {
      display: inline-block;
      width: 2rem;
      height: 2rem;
      border: 3px solid var(--bg-1);
      border-top-color: var(--accent);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 200px;
      gap: 0.75rem;
      color: var(--ink-muted);
      text-align: center;
    }

    .empty-state-icon {
      font-size: 3rem;
      opacity: 0.5;
    }

    .empty-state-text {
      margin: 0;
      font-size: 0.95rem;
    }

    .error-message {
      border: 1px solid #dc2626;
      border-radius: 6px;
      background: #fee2e2;
      padding: 1rem;
      color: #dc2626;
      font-size: 0.95rem;
      margin-bottom: 1rem;
    }

    .search-query {
      font-size: 0.85rem;
      color: var(--ink-muted);
      margin-bottom: 1rem;
    }
  `;

  /**
   * Current search results state from Zustand store.
   * Passed by React wrapper component.
   */
  @property({attribute: false})
  public searchState: SearchResultsState = {
    data: [],
    loading: false,
    error: null,
    query: '',
    page: 0,
    hasMore: true,
  };

  override render() {
    return html`
      <div class="results-wrapper">
        ${when(
          this.searchState.query,
          () => html`
            <div class="search-query">
              Results for "<strong>${this.searchState.query}</strong>"
            </div>
          `
        )}
        ${when(
          this.searchState.error && !this.searchState.loading,
          () => html`
            <div class="error-message" part="error-message" role="alert">
              ${this.searchState.error}
            </div>
          `
        )}
        ${when(
          this.searchState.loading && this.searchState.data.length === 0,
          () => html`
            <div class="loading-container" part="loading-spinner">
              <div class="spinner"></div>
              <span>Loading results...</span>
            </div>
          `,
          () => html`
            ${when(
              this.searchState.data.length > 0,
              () => html`
                <div class="results-grid" part="results-container">
                  ${repeat(
                    this.searchState.data,
                    (result) => result.id,
                    (result) => html`
                      <atomock-search-product-card
                        .image=${result.image}
                        .title=${result.title}
                        .price=${result.price}
                      ></atomock-search-product-card>
                    `
                  )}
                </div>
              `,
              () => html`
                ${when(
                  !this.searchState.loading,
                  () => html`
                    <div class="empty-state" part="empty-state">
                      <div class="empty-state-icon">🔍</div>
                      <p class="empty-state-text">
                        ${this.searchState.query
                          ? 'No results found'
                          : 'Enter a search query to see results'}
                      </p>
                    </div>
                  `
                )}
              `
            )}
          `
        )}

        <atomock-search-pagination
          ?has-more="${this.searchState.hasMore && !this.searchState.error}"
          ?loading="${this.searchState.loading}"
          @load-more="${this.handleLoadMore}"
        ></atomock-search-pagination>
      </div>
    `;
  }

  private handleLoadMore(): void {
    // Bubble event to parent React component for handling
    this.dispatchEvent(
      new CustomEvent('search-load-more', {
        bubbles: true,
        composed: true,
        detail: {
          query: this.searchState.query,
          page: this.searchState.page,
        },
      })
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomock-search-results': AtomockSearchResults;
  }
}
