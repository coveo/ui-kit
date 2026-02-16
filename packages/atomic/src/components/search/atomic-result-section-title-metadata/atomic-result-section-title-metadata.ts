import {css, LitElement} from 'lit';
import {customElement} from 'lit/decorators.js';
import {ItemSectionMixin} from '@/src/mixins/item-section-mixin';

/**
 * This section is intended to display some fields that are directly related to the title of the result.
 * In commerce, this could be the product rating, which is tied to the nature of the product itself,
 * rather than to the product's description.
 *
 * Behavior:
 * * Has a very small font size.
 * * Is the closest element beneath the title section.
 */
@customElement('atomic-result-section-title-metadata')
export class AtomicResultSectionTitleMetadata extends ItemSectionMixin(
  LitElement,
  css`
@reference '../../common/template-system/sections/sections.css';
atomic-result-section-title-metadata {
  @apply section-metadata;
}`
) {}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-result-section-title-metadata': AtomicResultSectionTitleMetadata;
  }
}
