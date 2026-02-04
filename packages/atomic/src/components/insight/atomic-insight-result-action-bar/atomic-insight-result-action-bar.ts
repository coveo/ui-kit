import {css, LitElement} from 'lit';
import {customElement} from 'lit/decorators.js';
import {ItemSectionMixin} from '@/src/mixins/item-section-mixin';

/**
 * The `atomic-insight-result-action-bar` component displays an action bar for an Insight result and hosts action buttons such as share, open, or more options related to the result.
 *
 * @slot (default) - Action buttons to display in the action bar.
 */
@customElement('atomic-insight-result-action-bar')
export class AtomicInsightResultActionBar extends ItemSectionMixin(
  LitElement,
  css`
    @reference '../../../utils/tailwind.global.tw.css';
    atomic-insight-result-action-bar {
      @apply invisible absolute -top-4 right-6 flex;
    }
    atomic-insight-result-action-bar > :not(:last-child) button {
      @apply rounded-r-none border-r-0;
    }
    atomic-insight-result-action-bar > :not(:last-child) button:hover {
      @apply border-r;
    }
    atomic-insight-result-action-bar > :not(:first-child) button {
      @apply rounded-tl-none rounded-bl-none;
    }
  `
) {}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-insight-result-action-bar': AtomicInsightResultActionBar;
  }
}
