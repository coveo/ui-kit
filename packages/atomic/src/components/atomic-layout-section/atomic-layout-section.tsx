import {Component, Prop} from '@stencil/core';
import {Section} from './sections';

/**
 * The `atomic-layout-section` allows to identify various sections for the related `atomic-layout`.
 */
@Component({
  tag: 'atomic-layout-section',
  shadow: false,
})
export class AtomicLayoutSection {
  /**
   * Name of the layout's section.
   */
  @Prop() public section!: Section;
  /**
   * For column sections, the minimum horizontal space it should take.
   * E.g. '300px'
   */
  @Prop() public minWidth?: string;
  /**
   * For column sections, the maximum horizontal space it should take.
   * E.g. '300px'
   */
  @Prop() public maxWidth?: string;
}
