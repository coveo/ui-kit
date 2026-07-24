import {html, LitElement, nothing} from 'lit';
import {HeadlessController} from '../controllers/headless-controller.js';
import {baseStyles, facetStyles} from '../shared-styles.js';

/**
 * A regular (checkbox) facet backed by a Headless `Facet` controller. `heading`
 * is the display title. The facet hides itself when it has no values for the
 * current query.
 */
export class SearchFacet extends LitElement {
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
    const values = state?.values ?? [];
    this.hidden = values.length === 0;
    if (values.length === 0) {
      return nothing;
    }

    return html`
      <h3>${this.heading}</h3>
      <ul>
        ${values.map(
          (value) => html`
            <li>
              <label>
                <input
                  type="checkbox"
                  .checked=${value.state === 'selected'}
                  @change=${() => this.controller.toggleSelect(value)}
                />
                <span class="name">${value.value}</span>
                <span class="count">${value.numberOfResults}</span>
              </label>
            </li>
          `
        )}
      </ul>
      ${state.hasActiveValues
        ? html`<button type="button" class="clear" @click=${() => this.controller.deselectAll()}>
            Clear
          </button>`
        : nothing}
    `;
  }
}

customElements.define('search-facet', SearchFacet);
