import {css, html, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';

/**
 * The `atomock-product-image` component renders a product image with a placeholder fallback.
 *
 * @part image - The image element.
 * @part placeholder - The placeholder element shown when no image is available.
 */
@customElement('atomock-product-image')
export class AtomockProductImage extends LitElement {
  static override styles = css`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }

    .image,
    .placeholder {
      display: block;
      width: 100%;
      height: 100%;
    }

    .image {
      object-fit: cover;
      object-position: center;
    }

    .placeholder {
      background: var(--atomock-product-image-placeholder-bg, var(--bg-1));
    }
  `;

  /** The product image URL. */
  @property({type: String})
  public src = '';

  /** The image alt text. */
  @property({type: String})
  public alt = '';

  override render() {
    if (!this.src) {
      return html`<div
        class="placeholder"
        part="placeholder"
        aria-hidden="true"
      ></div>`;
    }

    return html`
      <img
        class="image"
        part="image"
        src=${this.src}
        alt=${this.alt}
        loading="lazy"
      />
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomock-product-image': AtomockProductImage;
  }
}
