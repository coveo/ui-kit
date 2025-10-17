import {css, LitElement} from 'lit';
import {customElement} from 'lit/decorators.js';
import {ItemSectionMixin} from '@/src/mixins/item-section-mixin';
/**
 * This section displays the folded results, available when using the <atomic-result-children> component.
 *
 * Behavior:
 * * Shows children at the bottom of the result, indented and wrapped in a border.
 */
@customElement('atomic-result-section-children')
export class AtomicResultSectionChildren extends ItemSectionMixin(
  LitElement,
  css`
@reference '../../common/template-system/sections/sections.css';
atomic-result-section-children {
  @apply section-children;
}`
) {}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-result-section-children': AtomicResultSectionChildren;
  }
}
