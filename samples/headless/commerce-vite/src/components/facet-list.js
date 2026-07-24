import {css, html, LitElement, nothing} from 'lit';
import {HeadlessController} from '../controllers/headless-controller.js';
import {baseStyles} from '../shared-styles.js';

/**
 * Renders the facets for a search or product-listing controller.
 *
 * Commerce facets are configured in the Coveo Merchandising Hub, not by the
 * front end: `facetGenerator()` returns a ready-made sub-controller per facet.
 * This component subscribes to the parent controller so it re-renders on every
 * query (including facet selections, which trigger a new query and refresh the
 * values and counts).
 *
 * To keep the sample focused, only `regular` (checkbox) facets are rendered;
 * numeric, date, and hierarchical facets each need their own UI and are skipped.
 */
export class FacetList extends LitElement {
  static styles = [
    baseStyles,
    css`
      :host {
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
      }

      /* Divider between facet groups */
      .facet:not(:last-of-type) {
        padding-bottom: 1.25rem;
        border-bottom: 1px solid var(--border);
      }

      h3 {
        margin: 0 0 0.6rem;
        font-weight: 600;
        font-size: 0.95rem;
      }

      .values {
        display: flex;
        flex-direction: column;
        gap: 0.3rem;
      }

      label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        cursor: pointer;
        font-size: 0.9rem;
        color: var(--text);
      }

      input[type='checkbox'] {
        flex: none;
        width: 15px;
        height: 15px;
        margin: 0;
        accent-color: var(--accent);
        cursor: pointer;
      }

      .name {
        flex: 1;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .count {
        flex: none;
        margin-left: auto;
        color: var(--text-muted);
      }

      .clear {
        margin-top: 0.5rem;
        padding: 0.2rem 0.6rem;
        font-size: 0.85rem;
        color: var(--text-muted);
      }
    `,
  ];

  connectedCallback() {
    super.connectedCallback();
    if (this.controller && !this.generator) {
      this.generator = this.controller.facetGenerator();
      new HeadlessController(this, this.controller);
    }
  }

  render() {
    const facets = (this.generator?.facets ?? []).filter((facet) => facet.type === 'regular');

    return html`
      ${facets.map(
        (facet) => html`
          <div class="facet">
            <h3>${facet.state.displayName ?? facet.state.facetId}</h3>
            <div class="values">
              ${facet.state.values.slice(0, 8).map(
                (value) => html`
                  <label>
                    <input
                      type="checkbox"
                      .checked=${value.state === 'selected'}
                      @change=${() => facet.toggleSelect(value)}
                    />
                    <span class="name">${value.value}</span>
                    <span class="count">${value.numberOfResults}</span>
                  </label>
                `
              )}
            </div>
            ${facet.state.hasActiveValues
              ? html`<button type="button" class="clear" @click=${() => facet.deselectAll()}>
                  Clear
                </button>`
              : nothing}
          </div>
        `
      )}
    `;
  }
}

customElements.define('commerce-facet-list', FacetList);
