import {Component, h, State} from '@stencil/core';
import {
  type InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import type {InsightBindings} from '../atomic-insight-interface/atomic-insight-interface';

/**
 * @internal
 */
@Component({
  tag: 'atomic-insight-tabs',
})
export class AtomicInsightTabs
  implements InitializableComponent<InsightBindings>
{
  @InitializeBindings() public bindings!: InsightBindings;

  @State() public error!: Error;

  public render() {
    return (
      <atomic-tab-bar>
        <slot></slot>
      </atomic-tab-bar>
    );
  }
}
