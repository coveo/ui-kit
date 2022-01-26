import {Component, Element, Prop} from '@stencil/core';
import {randomID} from '../../utils/utils';
import {buildSearchLayout} from './search-layout';

export type Layout = 'search';

@Component({
  tag: 'atomic-layout',
  styleUrl: 'atomic-layout.pcss',
  shadow: false,
})
export class AtomicLayout {
  @Element() private host!: HTMLElement;

  @Prop({reflect: true}) public layout: Layout = 'search';
  @Prop() public mobileBreakpoint = '1024px';

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
        return buildSearchLayout(this.host, this.mobileBreakpoint);
    }
  }
}
