import type {InteractiveSpotlightContent, SpotlightContent} from '@coveo/headless/commerce';
import {type CSSResultGroup, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {CommerceResultElement} from '@/src/components/commerce/product-list/commerce-result-element';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles';
import '@/src/components/commerce/atomic-product-image/atomic-product-image';
import '@/src/components/commerce/atomic-product-link/atomic-product-link';
import '@/src/components/commerce/atomic-product-text/atomic-product-text';

/**
 * The `atomic-spotlight-content` component is used internally by the `atomic-commerce-product-list` component to
 * render each Spotlight Content item with the matching `atomic-spotlight-content-template`.
 */
@customElement('atomic-spotlight-content')
@withTailwindStyles
export class AtomicSpotlightContent extends CommerceResultElement {
  static styles: CSSResultGroup = css`
    @reference '../../../utils/tailwind.global.tw.css';

    :host {
      @apply relative block h-full;
    }

    .result-component,
    .result-root {
      @apply h-full;
    }

    .spotlight-content-card {
      @apply rounded-xl flex h-full flex-col gap-4;
      box-sizing: border-box;
      padding: 3.125rem;
      background-color: color-mix(in srgb, var(--atomic-primary) 10%, transparent);
    }

    .spotlight-content-tag {
      @apply text-primary border-primary text-sm inline-flex h-8 items-center gap-1 self-start rounded-full border px-3 py-2;
      box-sizing: border-box;
      line-height: 1rem;

      .spotlight-content-icon {
        @apply flex size-3 shrink-0;
      }

      atomic-commerce-text {
        background-image: linear-gradient(
          90deg,
          var(--atomic-primary),
          var(--atomic-primary-light)
        );
        background-clip: text;
        color: transparent;
      }
    }

    .spotlight-content-body {
      @apply flex flex-1 flex-col justify-center gap-4;
    }

    atomic-product-image::part(product-image) {
      @apply bg-neutral-lighter rounded-xl h-auto;
      aspect-ratio: 379 / 443;
      object-fit: contain;
    }

    .spotlight-content-details {
      @apply flex flex-col gap-4;
    }

    .spotlight-content-name {
      @apply text-on-background text-2xl font-bold;
      line-height: 1.5rem;
    }

    .spotlight-content-call-to-action a {
      @apply text-primary text-xl inline-flex items-center gap-2 font-bold no-underline hover:underline;
      line-height: 1.5rem;

      .spotlight-content-icon {
        @apply flex size-6 shrink-0;
      }
    }

    .spotlight-content-visually-hidden {
      @apply sr-only;
    }

    .display-list .spotlight-content-body {
      @apply flex-row items-center justify-start gap-0;

      atomic-product-image {
        @apply shrink-0;
      }

      atomic-product-image::part(product-image) {
        @apply mr-4;
        width: min(15rem, 33vw);
      }
    }

    .link-container {
      display: none;
    }
  `;

  /**
   * The Spotlight Content item.
   */
  @property({type: Object, attribute: false}) spotlightContent!: SpotlightContent;

  /**
   * The `InteractiveSpotlightContent` sub-controller used to log analytics when the Spotlight Content is selected.
   */
  @property({type: Object, attribute: false})
  interactiveSpotlightContent!: InteractiveSpotlightContent;

  protected readonly elementPrefix = 'atomic-spotlight-content';

  protected get result() {
    return this.spotlightContent;
  }

  protected get interactiveResult() {
    return this.interactiveSpotlightContent;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-spotlight-content': AtomicSpotlightContent;
  }
}
