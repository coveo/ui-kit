import {Result} from '@coveo/headless';
import {Component, Event, EventEmitter, Prop, State, h} from '@stencil/core';
import AttachIcon from '../../../images/attach.svg';
import CopyIcon from '../../../images/copy-dark.svg';
import EmailIcon from '../../../images/email.svg';
import QuickviewIcon from '../../../images/preview.svg';
import FeedIcon from '../../../images/share-post.svg';
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

export enum Actions {
  CopyToClipboard = 'copyToClipboard',
  AttachToCase = 'attachToCase',
  Quickview = 'quickview',
  PostToFeed = 'postToFeed',
  SendAsEmail = 'sendAsEmail',
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
    eventName: 'atomicInsightResultActionClicked',
    composed: true,
    cancelable: true,
    bubbles: true,
  })
  private actionClicked!: EventEmitter<InsightResultActionClickedEvent>;

  /**
   * Specify the result action icon to display.
   */
  @Prop({mutable: true}) public icon = '';

  /**
   * The text tooltip to show on the result action icon.
   */
  @Prop({mutable: true}) public tooltip = '';

  /**
   * The type of action to perform when the result action is clicked. This will be sent along the event fired when the button is clicked.
   */
  @Prop({mutable: true}) public action: Actions | string = '';

  private onClick() {
    this.actionClicked.emit({action: this.action, result: this.result});
  }

  private getIcon() {
    if (this.icon) {
      return this.icon;
    }

    switch (this.action) {
      case Actions.CopyToClipboard:
        return CopyIcon;
      case Actions.AttachToCase:
        return AttachIcon;
      case Actions.Quickview:
        return QuickviewIcon;
      case Actions.PostToFeed:
        return FeedIcon;
      case Actions.SendAsEmail:
        return EmailIcon;
      default:
        return QuickviewIcon;
    }
  }

  public render() {
    return (
      <IconButton
        partPrefix="result-action"
        style="outline-neutral"
        icon={this.getIcon()}
        title={this.tooltip}
        onClick={() => this.onClick()}
      />
    );
  }
}
