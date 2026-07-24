import {css, html, LitElement, nothing} from 'lit';
import {HeadlessController} from '../controllers/headless-controller.js';
import {baseStyles} from '../shared-styles.js';

/**
 * Active facet selections as removable chips, backed by a Headless
 * `BreadcrumbManager`. Hidden when nothing is selected.
 */
export class Breadcrumbs extends LitElement {
  static styles = [
    baseStyles,
    css`
      :host {
        display: flex;
        flex-wrap: wrap;
        gap: 0.4rem;
        align-items: center;
        margin-bottom: 1.25rem;
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
    if (this.controller && !this.bound) {
      new HeadlessController(this, this.controller);
      this.bound = true;
    }
  }

  render() {
    const state = this.controller?.state;
    const facetBreadcrumbs = state?.facetBreadcrumbs ?? [];
    const categoryFacetBreadcrumbs = state?.categoryFacetBreadcrumbs ?? [];

    const crumbs = [
      ...facetBreadcrumbs.flatMap((facet) =>
        facet.values.map((value) => ({
          key: `${facet.facetId}:${value.value.value}`,
          label: `${facet.field}: ${value.value.value}`,
          deselect: () => value.deselect(),
        }))
      ),
      // A category (hierarchical) selection is shown as a single chip spanning
      // the whole drilled-down path, e.g. "ec_category: Sensors / Cameras".
      ...categoryFacetBreadcrumbs.map((facet) => ({
        key: facet.facetId,
        label: `${facet.field}: ${facet.path.map((value) => value.value).join(' / ')}`,
        deselect: () => facet.deselect(),
      })),
    ];

    this.hidden = crumbs.length === 0;
    if (crumbs.length === 0) {
      return nothing;
    }

    return html`
      ${crumbs.map(
        (crumb) => html` <button type="button" @click=${crumb.deselect}>${crumb.label} ✕</button> `
      )}
      <button type="button" class="clear" @click=${() => this.controller.deselectAll()}>
        Clear all
      </button>
    `;
  }
}

customElements.define('search-breadcrumbs', Breadcrumbs);
