import {css, LitElement} from 'lit';
import {customElement} from 'lit/decorators.js';
import {ItemSectionMixin} from '@/src/mixins/item-section-mixin';

/**
 * This section is intended to display the field that's important for its search criteria
 * For example, in Commerce, a product's price is often more important than the title itself.
 *
 * Behavior:
 * * Has a very large font size.
 * * Is the second closest element beneath the title section.
 */
@customElement('atomic-result-section-emphasized')
export class AtomicResultSectionEmphasized extends ItemSectionMixin(
  LitElement,
  css`
@reference '../../common/template-system/sections/sections.css';
atomic-result-section-emphasized {
  @apply section-emphasized;
}`
) {}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-result-section-emphasized': AtomicResultSectionEmphasized;
  }
}
