import {Component, Host, h} from '@stencil/core';

@Component({
  tag: 'atomic-modal',
  shadow: true,
})
export class AtomicModal {
  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }
}
