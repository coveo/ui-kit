import {buildCriterionExpression} from '@coveo/headless';
import {css, html, LitElement, nothing} from 'lit';
import {HeadlessController} from '../controllers/headless-controller.js';
import {baseStyles} from '../shared-styles.js';

/**
 * Sort dropdown backed by a Headless `Sort` controller. `options` is a list of
 * `{label, criterion}`; the criterion expression is used to match the applied
 * sort and to apply a new one.
 */
export class SortDropdown extends LitElement {
  static styles = [
    baseStyles,
    css`
      .sort {
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

  #onChange(e) {
    const selected = this.options.find(
      (option) => buildCriterionExpression(option.criterion) === e.target.value
    );
    if (selected) {
      this.controller.sortBy(selected.criterion);
    }
  }

  render() {
    const options = this.options ?? [];
    if (!this.controller || options.length === 0) {
      return nothing;
    }
    const current = this.controller.state.sortCriteria;

    return html`
      <div class="sort">
        <label for="sort-select">Sort by:</label>
        <select id="sort-select" @change=${(e) => this.#onChange(e)}>
          ${options.map((option) => {
            const expression = buildCriterionExpression(option.criterion);
            return html`<option value=${expression} ?selected=${expression === current}>
              ${option.label}
            </option>`;
          })}
        </select>
      </div>
    `;
  }
}

customElements.define('search-sort', SortDropdown);
