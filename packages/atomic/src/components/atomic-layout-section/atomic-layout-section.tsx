import {Component, Prop} from '@stencil/core';
import {Section} from './sections';

/**
 * The `atomic-layout-section` lets you identify various sections for the related `atomic-layout` component.
 */
@Component({
  tag: 'atomic-layout-section',
  shadow: false,
})
export class AtomicLayoutSection {
  /**
   * The name of the layout section.
   */
  @Prop({reflect: true}) public section!: Section;
  /**
   * For column sections, the minimum horizontal space it should take.
   * E.g. '300px'
   */
  @Prop({reflect: true}) public minWidth?: string;
  /**
   * For column sections, the maximum horizontal space it should take.
   * E.g. '300px'
   */
  @Prop({reflect: true}) public maxWidth?: string;
}
