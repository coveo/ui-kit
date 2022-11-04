import {Component, Element} from '@stencil/core';
import {randomID} from '../../../utils/utils';

/**
 * @internal
 */
@Component({
  tag: 'atomic-ipx-layout',
  styles: 'atomic-ipx-layout.pcss',
  shadow: false,
})
export class AtomicIPXLayout {
  @Element() private host!: HTMLElement;
  public componentDidLoad() {
    const id = this.host.id || randomID('atomic-ipx-layout-');
    this.host.id = id;
  }
}
