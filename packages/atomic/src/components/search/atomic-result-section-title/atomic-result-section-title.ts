import {css, LitElement} from 'lit';
import {customElement} from 'lit/decorators.js';
import {ItemSectionMixin} from '@/src/mixins/item-section-mixin';

/**
 * This section is intended to display the result's name, and its main use is to make the result list scannable.
 * This is usually the page title.
 *
 * Behavior:
 * * Has a fixed height of two lines on grid layouts.
 * * Exposes the `--line-height` CSS variable so child elements can adjust to the current line height.
 * * Has a defined CSS `color` property for text.
 */
@customElement('atomic-result-section-title')
export class AtomicResultSectionTitle extends ItemSectionMixin(
  LitElement,
  css`
@reference '../../common/template-system/sections/sections.css';
atomic-result-section-title {
  @apply section-title;
}`
) {}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-result-section-title': AtomicResultSectionTitle;
  }
}
