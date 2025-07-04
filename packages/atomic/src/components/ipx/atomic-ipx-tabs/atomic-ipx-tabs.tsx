import {Component, h, State} from '@stencil/core';
import {
  type InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import type {Bindings} from '../../search/atomic-search-interface/atomic-search-interface';

/**
 * @internal
 */
@Component({
  tag: 'atomic-ipx-tabs',
})
export class AtomicIPXTabs implements InitializableComponent {
  @InitializeBindings() public bindings!: Bindings;

  @State() public error!: Error;

  public render() {
    return (
      <atomic-tab-bar>
        <slot></slot>
      </atomic-tab-bar>
    );
  }
}
