import {css, LitElement} from 'lit';
import {customElement} from 'lit/decorators.js';
import {ItemSectionMixin} from '@/src/mixins/item-section-mixin';

/**
 * This section is meant to render additional descriptive information about the result.
 *
 * Behavior:
 * * Has a maximum height of two lines.
 * ** We recommend that you use `atomic-result-fields-list` to ensure that the fields in this section don’t overflow.
 * * Exposes the `--line-height` variable so child elements can adjust to the current line height.
 * * Has a defined CSS `color` property for text.
 * * Has a font weight.
 */
@customElement('atomic-result-section-bottom-metadata')
export class AtomicResultSectionBottomMetadata extends ItemSectionMixin(
  LitElement,
  css`
@reference '../../common/template-system/sections/sections.css';
atomic-result-section-bottom-metadata {
  @apply section-bottom-metadata;
}`
) {}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-result-section-bottom-metadata': AtomicResultSectionBottomMetadata;
  }
}
