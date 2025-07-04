import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {Section} from './sections';

/**
 * The `atomic-layout-section` lets you identify various sections for the related `atomic-layout` component.
 */
@customElement('atomic-layout-section')
export class AtomicLayoutSection extends LitElement {
  /**
   * The name of the layout section.
   */
  @property({type: String, reflect: true})
  section!: Section;
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

  render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-layout-section': AtomicLayoutSection;
  }
}
