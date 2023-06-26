import {Component, Prop, State, h} from '@stencil/core';
import QuickView from '../../../images/quickview.svg';
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
  @Prop() public icon = QuickView;

  /**
   * The text tooltip to show on the result action icon
   */
  @Prop({reflect: true}) public label?: string;

  public render() {
    return (
      <IconButton
        icon={this.icon}
        title={this.label}
        style="outline-neutral"
        partPrefix="result-action"
      />
    );
  }
}
