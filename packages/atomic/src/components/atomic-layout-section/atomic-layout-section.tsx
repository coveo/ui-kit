import {Component, Prop} from '@stencil/core';
import {Section} from './sections';

@Component({
  tag: 'atomic-layout-section',
  shadow: false,
})
export class AtomicLayoutSection {
  @Prop() public section!: Section;
  @Prop() public minWidth?: string;
  @Prop() public maxWidth?: string;
}
