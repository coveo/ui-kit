import {Component, Prop, State, h} from '@stencil/core';
import Quickview from '../../../images/quickview.svg';
import {
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {IconButton} from '../../common/iconButton';
import {Bindings} from '../../search/atomic-search-interface/atomic-search-interface';

/**
 * @internal
 */
@Component({
  tag: 'atomic-insight-result-action',
  styleUrl: 'atomic-insight-result-action.pcss',
})
export class AtomicInsightResultAction implements InitializableComponent {
  @InitializeBindings() public bindings!: Bindings;
  @State() public error!: Error;

  /**
   * Specify the result action icon to display.
   */
  @Prop({mutable: true}) public icon = Quickview;

  /**
   * The text tooltip to show on the result action icon
   */
  @Prop({mutable: true}) public tooltip = '';

  public render() {
    return (
      <IconButton
        partPrefix="result-action"
        style="outline-neutral"
        icon={this.icon}
        title={this.tooltip}
      />
    );
  }
}
