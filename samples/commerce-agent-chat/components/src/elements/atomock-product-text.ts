import {css, html, LitElement, nothing} from 'lit';
import {customElement, property} from 'lit/decorators.js';

/**
 * The `atomock-product-text` component renders secondary product text content.
 *
 * @part text - The text element.
 */
@customElement('atomock-product-text')
export class AtomockProductText extends LitElement {
  static override styles = css`
    :host {
      display: block;
    }

    .text {
      margin: 0;
      font-size: var(--atomock-product-text-font-size, 0.72rem);
      font-weight: var(--atomock-product-text-font-weight, 400);
      line-height: var(--atomock-product-text-line-height, 1.3);
      color: var(--atomock-product-text-color, var(--ink-muted));
      display: -webkit-box;
      -webkit-line-clamp: var(--atomock-product-text-lines, 2);
      -webkit-box-orient: vertical;
      overflow: hidden;
      word-break: break-word;
    }
  `;

  /** The text content to render. */
  @property({type: String})
  public text = '';

  override render() {
    if (!this.text) {
      return nothing;
    }

    return html`<p class="text" part="text">${this.text}</p>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomock-product-text': AtomockProductText;
  }
}
