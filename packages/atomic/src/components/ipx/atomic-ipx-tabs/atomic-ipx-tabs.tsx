import {Component, h, State} from '@stencil/core';
import {
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {Bindings} from '../../search/atomic-search-interface/atomic-search-interface';

/**
 * @internal
 */
@Component({
  tag: 'atomic-ipx-tabs',
  styleUrl: './atomic-ipx-tabs.pcss',
})
export class AtomicIPXTabs implements InitializableComponent {
  @InitializeBindings() public bindings!: Bindings;

  @State() public error!: Error;

  public render() {
    return (
      <tab-bar>
        <slot></slot>
      </tab-bar>
    );
  }
}
