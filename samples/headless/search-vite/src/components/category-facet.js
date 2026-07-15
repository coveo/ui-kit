import {html, LitElement, nothing} from 'lit';
import {HeadlessController} from '../controllers/headless-controller.js';
import {baseStyles, facetStyles} from '../shared-styles.js';

/**
 * A hierarchical (category) facet backed by a Headless `CategoryFacet`
 * controller. It shows a breadcrumb of the selected path and the values at the
 * current level; selecting a value drills down into its children.
 */
export class CategoryFacet extends LitElement {
  static styles = [baseStyles, facetStyles];

  connectedCallback() {
    super.connectedCallback();
    if (this.controller && !this.bound) {
      new HeadlessController(this, this.controller);
      this.bound = true;
    }
  }

  render() {
    const state = this.controller?.state;
    if (!state) {
      this.hidden = true;
      return nothing;
    }

    const {
      valuesAsTrees,
      selectedValueAncestry,
      hasActiveValues,
      canShowMoreValues,
    } = state;
    const active = selectedValueAncestry[selectedValueAncestry.length - 1];
    const current = hasActiveValues ? (active?.children ?? []) : valuesAsTrees;

    this.hidden = !hasActiveValues && current.length === 0;
    if (this.hidden) {
      return nothing;
    }

    return html`
      <h3>${this.heading}</h3>
      ${hasActiveValues
        ? html`
            <ol class="breadcrumb">
              <li>
                <button
                  type="button"
                  @click=${() => this.controller.deselectAll()}
                >
                  All
                </button>
              </li>
              ${selectedValueAncestry.map(
                (value) => html`
                  <li>
                    <button
                      type="button"
                      @click=${() => this.controller.toggleSelect(value)}
                    >
                      ${value.value}
                    </button>
                  </li>
                `
              )}
            </ol>
          `
        : nothing}
      <ul>
        ${current.map(
          (value) => html`
            <li>
              <button
                type="button"
                class="link"
                @click=${() => this.controller.toggleSelect(value)}
              >
                <span class="name">${value.value}</span>
                <span class="count">${value.numberOfResults}</span>
              </button>
            </li>
          `
        )}
      </ul>
      ${canShowMoreValues
        ? html`
            <button
              type="button"
              class="more"
              @click=${() => this.controller.showMoreValues()}
            >
              Show more
            </button>
          `
        : nothing}
    `;
  }
}

customElements.define('search-category-facet', CategoryFacet);
