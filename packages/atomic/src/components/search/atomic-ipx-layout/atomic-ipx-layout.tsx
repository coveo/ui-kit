import {Component, Element} from '@stencil/core';
import {randomID} from '../../../utils/utils';
import {buildIPXLayout} from './ipx-layout';

/**
 * @internal
 */
@Component({
  tag: 'atomic-ipx-layout',
  shadow: false,
})
export class AtomicIPXLayout {
  @Element() private host!: HTMLElement;

  public componentDidLoad() {
    const id = this.host.id || randomID('atomic-ipx-layout-');
    this.host.id = id;

    const styleTag = document.createElement('style');
    styleTag.innerHTML = buildIPXLayout(this.host);
    this.host.appendChild(styleTag);
  }
}
