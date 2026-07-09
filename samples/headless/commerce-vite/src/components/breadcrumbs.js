import {css, html, LitElement, nothing} from 'lit';
import {HeadlessController} from '../controllers/headless-controller.js';
import {baseStyles} from '../shared-styles.js';

/**
 * Active facet selections as removable chips, backed by the `breadcrumbManager`
 * sub-controller of a search or product-listing controller. Hidden when nothing
 * is selected.
 */
export class Breadcrumbs extends LitElement {
  static styles = [
    baseStyles,
    css`
      :host([hidden]) {
        display: none;
      }

      .breadcrumbs {
        display: flex;
        flex-wrap: wrap;
        gap: 0.4rem;
        align-items: center;
      }

      button {
        font-size: 0.85rem;
        padding: 0.25rem 0.6rem;
        border-radius: 999px;
      }

      .clear {
        color: var(--text-muted);
      }
    `,
  ];

  connectedCallback() {
    super.connectedCallback();
    if (this.controller && !this.breadcrumbManager) {
      this.breadcrumbManager = this.controller.breadcrumbManager();
      new HeadlessController(this, this.controller);
    }
  }

  render() {
    const facetBreadcrumbs =
      this.breadcrumbManager?.state.facetBreadcrumbs ?? [];
    const crumbs = facetBreadcrumbs.flatMap((facet) =>
      facet.values.map((value) => ({
        key: `${facet.facetId}:${value.value.value}`,
        label: `${facet.displayName ?? facet.field}: ${value.value.value}`,
        deselect: () => value.deselect(),
      }))
    );

    this.hidden = crumbs.length === 0;
    if (crumbs.length === 0) {
      return nothing;
    }

    return html`
      <div class="breadcrumbs">
        ${crumbs.map(
          (crumb) => html`
            <button type="button" @click=${crumb.deselect}>
              ${crumb.label} ✕
            </button>
          `
        )}
        <button
          type="button"
          class="clear"
          @click=${() => this.breadcrumbManager.deselectAll()}
        >
          Clear all
        </button>
      </div>
    `;
  }
}

customElements.define('commerce-breadcrumbs', Breadcrumbs);
