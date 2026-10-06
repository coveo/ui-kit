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

    .result-root {
      @apply flex h-full flex-col gap-2;

      &.display-list {
        @apply flex-row items-center gap-4;

        atomic-product-image {
          @apply w-1/3 max-w-60 shrink-0;
        }
      }
    }

    .spotlight-content-body {
      @apply flex flex-col gap-1;
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
