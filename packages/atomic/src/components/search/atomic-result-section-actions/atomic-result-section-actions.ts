import {css, LitElement} from 'lit';
import {customElement} from 'lit/decorators.js';
import {ItemSectionMixin} from '@/src/mixins/item-section-mixin';

/**
 * This section is intended to display components that allow the user to perform an action on a result without having to view its details.
 * In commerce interface, the user can usually add the product to their cart or wish list.
 *
 * Behavior:
 * * Exposes the `--line-height` CSS variable so child elements can adjust to the current line height.
 * ** You should ensure that elements inside of it have `height: var(--line-height)`.
 * * Is a wrapping flexbox with a gap.
 * * May appear over, next to, or beneath the visual section.
 */
@customElement('atomic-result-section-actions')
export class AtomicResultSectionActions extends ItemSectionMixin(
  LitElement,
  css`
@reference '../../common/template-system/sections/sections.css';
atomic-result-section-actions {
  @apply section-actions;
}`
) {}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-result-section-actions': AtomicResultSectionActions;
  }
}
