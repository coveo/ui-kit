import {Result} from '@coveo/headless';
import {Component, Event, EventEmitter, Prop, State, h} from '@stencil/core';
import Quickview from '../../../images/quickview.svg';
import {
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {IconButton} from '../../common/iconButton';
import {Bindings} from '../../search/atomic-search-interface/atomic-search-interface';
import {ResultContext} from '../../search/result-template-components/result-template-decorators';

export interface InsightResultActionClickedEvent {
  action: string;
  result: Result;
}

/**
 * @internal
 */
@Component({
  tag: 'atomic-insight-result-action',
  styleUrl: 'atomic-insight-result-action.pcss',
})
export class AtomicInsightResultAction implements InitializableComponent {
  @InitializeBindings() public bindings!: Bindings;
  @ResultContext() private result!: Result;
  @State() public error!: Error;

  @Event({
    eventName: 'AtomicInsightResultActionClicked',
    composed: true,
    cancelable: true,
    bubbles: true,
  })
  private actionClicked!: EventEmitter<InsightResultActionClickedEvent>;

  /**
   * Specify the result action icon to display.
   */
  @Prop({mutable: true}) public icon = Quickview;

  /**
   * The text tooltip to show on the result action icon.
   */
  @Prop({mutable: true}) public tooltip = '';

  /**
   * The type of action to perform when the result action is clicked. This will be sent along the event fired when the button is clicked.
   */
  @Prop({mutable: true}) public action = '';

  private onClick() {
    this.actionClicked.emit({action: this.action, result: this.result});
  }

  public render() {
    return (
      <IconButton
        partPrefix="result-action"
        style="outline-neutral"
        icon={this.icon}
        title={this.tooltip}
        onClick={() => this.onClick()}
      />
    );
  }
}
