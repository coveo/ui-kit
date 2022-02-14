import {Component, Element, Prop} from '@stencil/core';
import {randomID} from '../../utils/utils';
import {buildSearchLayout} from './search-layout';

export type Layout = 'search';

/**
 * The `atomic-layout` helps organize elements in the page relative to one another.
 */
@Component({
  tag: 'atomic-layout',
  styleUrl: 'atomic-layout.pcss',
  shadow: false,
})
export class AtomicLayout {
  @Element() private host!: HTMLElement;
  /**
   * Name of the layout.
   */
  @Prop({reflect: true}) public layout!: Layout;
  // TODO: make breakpoint configurable & reuse in templates
  private breakpoint = '1024px';

  public connectedCallback() {
    const id = this.host.id || randomID('atomic-layout-');
    this.host.id = id;

    const styleTag = document.createElement('style');
    styleTag.innerHTML = this.style;
    this.host.appendChild(styleTag);
  }

  private get style() {
    switch (this.layout) {
      case 'search':
        return buildSearchLayout(this.host, this.breakpoint);
    }
  }
}
