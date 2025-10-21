import {css, LitElement} from 'lit';
import {customElement} from 'lit/decorators.js';
import {ItemSectionMixin} from '@/src/mixins/item-section-mixin';

/**
 *  This section is intended to render an informative summary of the result's content
 *
 * Behavior:
 * * Has a fixed height of one to three lines, depending on the layout and density.
 * * Ellipses overflowing text.
 * * Exposes the `--line-height` CSS variable so child elements can adjust to the current line height.
 * * Has a defined CSS `color` property for text.
 */
@customElement('atomic-result-section-excerpt')
export class AtomicResultSectionExcerpt extends ItemSectionMixin(
  LitElement,
  css`
@reference '../../common/template-system/sections/sections.css';
atomic-result-section-excerpt {
  @apply section-excerpt;
}`
) {}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-result-section-excerpt': AtomicResultSectionExcerpt;
  }
}
