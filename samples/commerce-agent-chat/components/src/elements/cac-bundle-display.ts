import {css, html, LitElement, nothing} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {map} from 'lit/directives/map.js';
import {when} from 'lit/directives/when.js';
import type {
  BundleTierConfig,
  Product,
} from '@coveo/commerce-agent-chat-core/types/commerce';
import './cac-price-display.js';

export interface BundleSlotWithProduct {
  categoryLabel: string;
  surfaceRef: string;
  product: Product | null;
}

export interface BundleTierWithProducts extends Omit<
  BundleTierConfig,
  'slots'
> {
  slots: BundleSlotWithProduct[];
}

/**
 * The `cac-bundle-display` component renders bundle tiers and product slots.
 */
@customElement('cac-bundle-display')
export class CacBundleDisplay extends LitElement {
  static override styles = css`
    :host {
      display: block;
      width: 100%;
    }

    .bundle-display {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      width: 100%;
    }

    .bundle-tabs {
      display: flex;
      gap: 0.4rem;
      flex-wrap: wrap;
    }

    .bundle-tab {
      padding: 0.4rem 0.9rem;
      border: 2px solid rgba(0, 212, 255, 0.3);
      border-radius: 10px;
      background: rgba(22, 45, 66, 0.5);
      color: var(--ink);
      font: inherit;
      font-size: 0.84rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .bundle-tab:hover {
      border-color: var(--accent);
      box-shadow: 0 0 15px rgba(0, 212, 255, 0.2);
    }

    .bundle-tab:focus-visible {
      outline: 2px solid var(--accent);
      outline-offset: 2px;
    }

    .bundle-tab--active {
      background: linear-gradient(
        135deg,
        var(--accent-warm) 0%,
        var(--accent) 100%
      );
      color: #000;
      border-color: var(--accent);
      box-shadow: 0 0 20px rgba(0, 212, 255, 0.4);
    }

    .bundle-description {
      margin: 0 0 0.5rem;
      font-size: 0.82rem;
      color: var(--ink-muted);
    }

    .bundle-slots {
      display: flex;
      gap: 0.65rem;
      overflow-x: auto;
      padding-bottom: 0.25rem;
    }

    .bundle-slot {
      flex: 0 0 160px;
      border: 2px solid rgba(0, 212, 255, 0.3);
      border-radius: 12px;
      background: linear-gradient(
        135deg,
        rgba(22, 45, 66, 0.5) 0%,
        rgba(26, 58, 82, 0.3) 100%
      );
      padding: 0.7rem;
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      transition: all 0.3s ease;
      box-shadow: 0 0 12px rgba(0, 212, 255, 0.1);
      backdrop-filter: blur(5px);
    }

    .bundle-slot:hover {
      border-color: rgba(0, 212, 255, 0.6);
      box-shadow: 0 0 25px rgba(0, 212, 255, 0.2);
      transform: translateY(-2px);
    }

    .bundle-slot__label {
      margin: 0;
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--accent);
    }

    .bundle-slot__image {
      width: 100%;
      height: 90px;
      object-fit: cover;
      border-radius: 8px;
      border: 1px solid rgba(0, 212, 255, 0.2);
      display: block;
    }

    .bundle-slot__image--placeholder {
      background: linear-gradient(
        45deg,
        rgba(0, 212, 255, 0.1),
        rgba(0, 212, 255, 0.05)
      );
    }

    .commerce-loading {
      border-radius: 6px;
      background: linear-gradient(
        90deg,
        rgba(26, 77, 109, 0.4) 25%,
        rgba(0, 212, 255, 0.15) 50%,
        rgba(26, 77, 109, 0.4) 75%
      );
      background-size: 600px 100%;
      animation: shimmer 1.4s infinite linear;
    }

    .commerce-loading--line {
      height: 12px;
      width: 45%;
    }

    .commerce-loading--line-wide {
      width: 70%;
    }

    .commerce-loading--image {
      width: 100%;
      height: 90px;
    }

    @keyframes shimmer {
      0% {
        background-position: -600px 0;
      }
      100% {
        background-position: 600px 0;
      }
    }

    .bundle-slot__name {
      margin: 0;
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--ink);
    }

    .bundle-slot__brand {
      margin: 0;
      font-size: 0.72rem;
      color: var(--ink-muted);
    }

    .text-muted {
      color: var(--ink-muted);
      font-size: 0.8rem;
    }
  `;

  /** The heading shown above the bundle tiers. */
  @property({type: String})
  public heading = '';

  /** The bundle tiers to render. */
  @property({attribute: false})
  public bundles: BundleTierWithProducts[] = [];

  /** Whether loading placeholders should be shown when bundles are empty. */
  @property({type: Boolean, attribute: 'is-loading'})
  public isLoading = false;

  @state()
  private activeIndex = 0;

  override willUpdate() {
    if (this.bundles.length === 0) {
      this.activeIndex = 0;
      return;
    }

    if (this.activeIndex > this.bundles.length - 1) {
      this.activeIndex = this.bundles.length - 1;
    }
  }

  override render() {
    if (this.bundles.length === 0 && !this.isLoading) {
      return nothing;
    }

    if (this.bundles.length === 0 && this.isLoading) {
      return this.renderLoadingState();
    }

    const activeBundle = this.bundles[this.activeIndex];

    return html`
      <div class="bundle-display">
        <h3 class="commerce-heading">${this.heading}</h3>
        ${when(
          this.bundles.length > 1,
          () => html`
            <div class="bundle-tabs" role="tablist" aria-label="Bundle tiers">
              ${map(this.bundles, (bundle, index) =>
                this.renderTab(bundle, index)
              )}
            </div>
          `
        )}
        ${when(Boolean(activeBundle), () => this.renderPanel(activeBundle))}
      </div>
    `;
  }

  private renderTab(bundle: BundleTierWithProducts, index: number) {
    const isActive = index === this.activeIndex;

    return html`
      <button
        id=${this.getTabId(index)}
        type="button"
        role="tab"
        class=${`bundle-tab${isActive ? ' bundle-tab--active' : ''}`}
        aria-selected=${isActive ? 'true' : 'false'}
        aria-controls=${this.getPanelId(index)}
        tabindex=${isActive ? '0' : '-1'}
        @click=${() => this.selectTab(index)}
        @keydown=${(event: KeyboardEvent) => this.onTabKeyDown(event, index)}
      >
        ${bundle.label}
      </button>
    `;
  }

  private renderPanel(bundle: BundleTierWithProducts) {
    return html`
      <div
        id=${this.getPanelId(this.activeIndex)}
        role="tabpanel"
        aria-labelledby=${this.getTabId(this.activeIndex)}
      >
        ${when(
          Boolean(bundle.description),
          () => html`<p class="bundle-description">${bundle.description}</p>`
        )}
        <div class="bundle-slots">
          ${map(bundle.slots, (slot, index) => this.renderSlot(slot, index))}
        </div>
      </div>
    `;
  }

  private renderLoadingState() {
    return html`
      <div class="bundle-display" aria-busy="true">
        <h3 class="commerce-heading">${this.heading}</h3>
        <div class="bundle-slots">
          ${Array.from({length: 3}, (_, index) =>
            this.renderLoadingSlot(index)
          )}
        </div>
      </div>
    `;
  }

  private renderLoadingSlot(index: number) {
    return html`
      <div class="bundle-slot" aria-hidden="true" data-index=${String(index)}>
        <div class="commerce-loading commerce-loading--line"></div>
        <div class="commerce-loading commerce-loading--image"></div>
        <div
          class="commerce-loading commerce-loading--line commerce-loading--line-wide"
        ></div>
      </div>
    `;
  }

  private renderSlot(slot: BundleSlotWithProduct, index: number) {
    return html`
      <article class="bundle-slot" data-index=${String(index)}>
        <p class="bundle-slot__label">${slot.categoryLabel}</p>
        ${when(
          Boolean(slot.product),
          () => this.renderSlotProduct(slot.product!),
          () => html`<p class="text-muted">Product not available</p>`
        )}
      </article>
    `;
  }

  private renderSlotProduct(product: Product) {
    return html`
      ${this.renderSlotProductImage(product)}
      <p class="bundle-slot__name">${product.ec_name}</p>
      <p class="bundle-slot__brand">${product.ec_brand}</p>
      <cac-price-display .product=${product}></cac-price-display>
    `;
  }

  private renderSlotProductImage(product: Product) {
    return when(
      Boolean(product.ec_image),
      () => html`
        <img
          src=${product.ec_image}
          alt=${product.ec_name}
          class="bundle-slot__image"
        />
      `,
      () => html`
        <div
          class="bundle-slot__image bundle-slot__image--placeholder"
          aria-hidden="true"
        ></div>
      `
    );
  }

  private selectTab(index: number) {
    this.activeIndex = index;
  }

  private onTabKeyDown(event: KeyboardEvent, index: number) {
    if (this.bundles.length < 2) {
      return;
    }

    const lastIndex = this.bundles.length - 1;
    let nextIndex: number | null = null;

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        nextIndex = index === lastIndex ? 0 : index + 1;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        nextIndex = index === 0 ? lastIndex : index - 1;
        break;
      case 'Home':
        nextIndex = 0;
        break;
      case 'End':
        nextIndex = lastIndex;
        break;
      default:
        return;
    }

    event.preventDefault();
    this.selectTab(nextIndex);
    this.updateComplete.then(() => this.focusTab(nextIndex!));
  }

  private focusTab(index: number) {
    this.renderRoot
      .querySelector<HTMLButtonElement>(`#${this.getTabId(index)}`)
      ?.focus();
  }

  private getPanelId(index: number) {
    return `bundle-panel-${index}`;
  }

  private getTabId(index: number) {
    return `bundle-tab-${index}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'cac-bundle-display': CacBundleDisplay;
  }
}
