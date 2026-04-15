import {css, html, LitElement, nothing} from 'lit';
import {customElement, property} from 'lit/decorators.js';

/**
 * The `atomock-product-link` component renders a product name as a link when a valid URL is provided.
 *
 * @part link - The anchor element.
 * @part text - The non-link text element.
 */
@customElement('atomock-product-link')
export class AtomockProductLink extends LitElement {
  static override styles = css`
    :host {
      display: block;
    }

    .text {
      margin: 0;
      line-height: var(--atomock-product-link-line-height, 1.3);
      font-size: var(--atomock-product-link-font-size, 0.8rem);
      font-weight: var(--atomock-product-link-font-weight, 600);
      color: var(--atomock-product-link-color, var(--ink));
      display: -webkit-box;
      -webkit-line-clamp: var(--atomock-product-link-lines, 2);
      -webkit-box-orient: vertical;
      overflow: hidden;
      word-break: break-word;
    }

    a.text {
      text-decoration: none;
    }

    a.text:hover {
      text-decoration: underline;
    }
  `;

  /** The text content to render. */
  @property({type: String})
  public text = '';

  /** The optional link URL for the product. */
  @property({type: String})
  public href = '';

  /** The optional target attribute applied when href is provided. */
  @property({type: String})
  public target = '';

  /** The optional rel attribute applied when href is provided. */
  @property({type: String})
  public rel = '';

  override render() {
    if (!this.text) {
      return nothing;
    }

    const safeHref = this.getSafeHref(this.href);
    if (!safeHref) {
      return html`<span class="text" part="text">${this.text}</span>`;
    }

    return html`
      <a
        class="text"
        part="link"
        href=${safeHref}
        target=${this.target || nothing}
        rel=${this.rel || nothing}
      >
        ${this.text}
      </a>
    `;
  }

  private getSafeHref(href: string) {
    const value = href.trim();
    if (!value || /^javascript:/i.test(value)) {
      return '';
    }
    return value;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomock-product-link': AtomockProductLink;
  }
}
