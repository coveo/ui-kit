import {css, html, LitElement, nothing} from 'lit';
import {HeadlessController} from '../controllers/headless-controller.js';
import {baseStyles} from '../shared-styles.js';

/** Shows the "Results X-Y of Z" summary for the current query. */
export class QuerySummary extends LitElement {
  static styles = [
    baseStyles,
    css`
      :host {
        color: var(--text-muted);
        font-size: 0.9rem;
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
    if (!state || !state.hasResults) {
      return nothing;
    }
    const {firstResult, lastResult, total, query} = state;
    return html`Results ${firstResult}-${lastResult} of
    ${total}${query ? ` for "${query}"` : nothing}`;
  }
}

customElements.define('search-summary', QuerySummary);
