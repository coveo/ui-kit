import {Result} from '@coveo/headless';
import {
  InsightAnalyticsActionCreators,
  loadInsightAnalyticsActions,
} from '@coveo/headless/insight';
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
import {IconButton} from '../../common/stencil-iconButton';
import {ResultContext} from '@/src/components/search/result-template-component-utils/context/stencil-result-template-decorators';
import {InsightBindings} from '../atomic-insight-interface/atomic-insight-interface';

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
export class AtomicInsightResultAction
  implements InitializableComponent<InsightBindings>
{
  @InitializeBindings() public bindings!: InsightBindings;
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
   * The text tooltip to show on the result action icon for some time after clicking the button.
   */
  @Prop({mutable: true}) public tooltipOnClick = '';

  /**
   * The type of action to perform when the result action is clicked. This will be sent along the event fired when the button is clicked.
   */
  @Prop({mutable: true}) public action: Actions | string = '';

  private actions!: InsightAnalyticsActionCreators;

  public initialize() {
    this.actions = loadInsightAnalyticsActions(this.bindings.engine);
  }

  private onClick() {
    if (this.tooltipOnClick) {
      const originalTooltip = this.tooltip;
      this.tooltip = this.tooltipOnClick;
      setTimeout(() => {
        this.tooltip = originalTooltip;
      }, 1000);
    }

    switch (this.action) {
      case Actions.CopyToClipboard:
        this.bindings.engine.dispatch(
          this.actions.logCopyToClipboard(this.result)
        );
        navigator.clipboard.writeText(this.result?.clickUri);
        break;
      case Actions.PostToFeed:
        this.bindings.engine.dispatch(
          this.actions.logFeedItemTextPost(this.result)
        );
        break;
      case Actions.SendAsEmail:
        this.bindings.engine.dispatch(
          this.actions.logCaseSendEmail(this.result)
        );
        break;
    }

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
