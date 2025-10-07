import {LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {LightDomMixin} from '@/src/mixins/light-dom';
import type {Section} from './atomic-layout-section-utils';

/**
 * The `atomic-layout-section` lets you identify various sections for the related `atomic-search-layout` or `atomic-commerce-layout` component.
 *
 * @slot default - The default slot where you can add child components to the section.
 */
@customElement('atomic-layout-section')
export class AtomicLayoutSection extends LightDomMixin(LitElement) {
  /**
   * The name of the layout section.
   */
  @property({type: String, reflect: true}) section!: Section;

  /**
   * For column sections, the minimum horizontal space it should take.
   * E.g. '300px'
   */
  @property({type: String, reflect: true, attribute: 'min-width'})
  minWidth?: string;

  /**
   * For column sections, the maximum horizontal space it should take.
   * E.g. '300px'
   */
  @property({type: String, reflect: true, attribute: 'max-width'})
  maxWidth?: string;
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-layout-section': AtomicLayoutSection;
  }
}
