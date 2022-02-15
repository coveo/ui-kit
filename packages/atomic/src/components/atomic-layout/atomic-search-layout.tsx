import {Component, Element} from '@stencil/core';
import {randomID} from '../../utils/utils';
import {buildSearchLayout} from './search-layout';

/**
 * The `atomic-search-layout` helps organize elements in the page.
 */
@Component({
  tag: 'atomic-search-layout',
  styleUrl: 'atomic-search-layout.pcss',
  shadow: false,
})
export class AtomicSearchLayout {
  @Element() private host!: HTMLElement;
  // TODO: make breakpoint configurable & reuse in templates
  private breakpoint = '1024px';

  public connectedCallback() {
    const id = this.host.id || randomID('atomic-search-layout-');
    this.host.id = id;

    const styleTag = document.createElement('style');
    styleTag.innerHTML = buildSearchLayout(this.host, this.breakpoint);
    this.host.appendChild(styleTag);
  }
}
