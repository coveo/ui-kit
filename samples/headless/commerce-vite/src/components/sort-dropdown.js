import {css, html, LitElement, nothing} from 'lit';
import {HeadlessController} from '../controllers/headless-controller.js';
import {baseStyles} from '../shared-styles.js';

/**
 * Sort dropdown backed by a commerce `Sort` sub-controller. Criteria are
 * serialized to JSON for the option values so the applied sort can be matched
 * and passed straight back to `sortBy`.
 */
export class SortDropdown extends LitElement {
  static styles = [
    baseStyles,
    css`
      .Sort {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        color: var(--text-muted);
      }

      select {
        padding: 0.4rem 0.6rem;
        border: 1px solid var(--border);
        border-radius: var(--radius-sm);
        background: var(--surface);
        color: var(--text);
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

  #label(criterion) {
    if (criterion.by === 'relevance') {
      return 'Relevance';
    }
    return criterion.fields
      .map((field) => field.displayName ?? field.name)
      .join(', ');
  }

  render() {
    const state = this.controller?.state;
    if (!state || state.availableSorts.length === 0) {
      return nothing;
    }

    return html`
      <div class="Sort">
        <label for="sort-select">Sort by:</label>
        <select
          id="sort-select"
          @change=${(e) => this.controller.sortBy(JSON.parse(e.target.value))}
        >
          ${state.availableSorts.map(
            (criterion) => html`
              <option
                value=${JSON.stringify(criterion)}
                ?selected=${JSON.stringify(state.appliedSort) ===
                JSON.stringify(criterion)}
              >
                ${this.#label(criterion)}
              </option>
            `
          )}
        </select>
      </div>
    `;
  }
}

customElements.define('commerce-sort-dropdown', SortDropdown);
