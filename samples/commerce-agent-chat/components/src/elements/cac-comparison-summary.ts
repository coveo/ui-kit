import {customElement, property} from 'lit/decorators.js';
import {css, html, LitElement, nothing} from 'lit';

/**
 * The `cac-comparison-summary` component renders summary text for comparisons.
 */
@customElement('cac-comparison-summary')
export class CacComparisonSummary extends LitElement {
  static override styles = css`
    :host {
      display: block;
      width: 100%;
    }

    .comparison-summary {
      border: 1px solid var(--border);
      border-radius: 10px;
      background: var(--surface-accent);
      padding: 0.9rem 1rem;
      width: 100%;
      box-sizing: border-box;
    }

    .comparison-summary__text {
      margin: 0;
      font-size: 0.88rem;
      line-height: 1.6;
      color: var(--ink);
    }
  `;

  /** The summary text to display. */
  @property({type: String})
  public text = '';

  override render() {
    if (!this.text.trim()) {
      return nothing;
    }

    return html`
      <div class="comparison-summary">
        <p class="comparison-summary__text">${this.text}</p>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'cac-comparison-summary': CacComparisonSummary;
  }
}
