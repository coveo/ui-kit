import {Component, h, State} from '@stencil/core';
import {
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {InsightBindings} from '../atomic-insight-interface/atomic-insight-interface';

/**
 * @internal
 */
@Component({
  tag: 'atomic-insight-tabs',
  styleUrl: './atomic-insight-tabs.pcss',
})
export class AtomicInsightTabs
  implements InitializableComponent<InsightBindings>
{
  @InitializeBindings() public bindings!: InsightBindings;

  @State() public error!: Error;

  public render() {
    return (
      <tab-bar>
        <slot></slot>
      </tab-bar>
    );
  }
}
