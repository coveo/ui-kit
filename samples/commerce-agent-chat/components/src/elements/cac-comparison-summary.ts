import {customElement, property} from 'lit/decorators.js';
import {css, html, LitElement, nothing} from 'lit';

/**
 * The `cac-comparison-summary` component renders summary text for comparisons.
 */
@customElement('cac-comparison-summary')
export class CacComparisonSummary extends LitElement {
  static override styles = css`
    .comparison-summary {
      border: 2px solid rgba(0, 212, 255, 0.2);
      border-radius: 12px;
      background: linear-gradient(
        135deg,
        rgba(22, 45, 66, 0.5) 0%,
        rgba(26, 58, 82, 0.3) 100%
      );
      padding: 0.9rem 1rem;
      backdrop-filter: blur(8px);
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
