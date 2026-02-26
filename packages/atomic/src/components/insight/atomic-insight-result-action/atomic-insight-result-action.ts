import type {Result} from '@coveo/headless';
import {
  type InsightAnalyticsActionCreators,
  loadInsightAnalyticsActions,
} from '@coveo/headless/insight';
import {css, LitElement} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {renderIconButton} from '@/src/components/common/icon-button';
import {ItemContextController} from '@/src/components/common/item-list/context/item-context-controller';
import type {InsightBindings} from '@/src/components/insight/atomic-insight-interface/atomic-insight-interface';
import {bindingGuard} from '@/src/decorators/binding-guard';
import {bindings} from '@/src/decorators/bindings';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import {LightDomMixin} from '@/src/mixins/light-dom';
import AttachIcon from '../../../images/attach.svg';
import CopyIcon from '../../../images/copy-dark.svg';
import EmailIcon from '../../../images/email.svg';
import QuickviewIcon from '../../../images/preview.svg';
import FeedIcon from '../../../images/share-post.svg';

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
 * The `atomic-insight-result-action` component renders an interactive button
 * that emits an `atomicInsightResultActionClicked` event when clicked.
 *
 * @part result-action-container - The result action container
 * @part result-action-button - The result action button
 * @part result-action-icon - The result action icon
 */
@customElement('atomic-insight-result-action')
@bindings()
export class AtomicInsightResultAction
  extends LightDomMixin(LitElement)
  implements InitializableComponent<InsightBindings>
{
  @state() public bindings!: InsightBindings;
  @state() public error!: Error;
  @state() private currentTooltip = '';

  private itemContextController!: ItemContextController<Result>;
  private actions!: InsightAnalyticsActionCreators;
  private tooltipResetTimeout?: ReturnType<typeof setTimeout>;

  /**
   * The result action icon to display.
   */
  @property({type: String}) icon = '';

  /**
   * The text tooltip to show on the result action icon.
   */
  @property({type: String}) tooltip = '';

  /**
   * The text tooltip to show on the result action icon for some time after clicking the button.
   */
  @property({type: String, attribute: 'tooltip-on-click'}) tooltipOnClick = '';

  /**
   * The type of action to perform when the result action is clicked.
   * This will be sent along the event fired when the button is clicked.
   */
  @property({type: String}) action: Actions | string = '';

  static styles = css`
    [part='result-action-button'] {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 2rem;
      width: 2rem;
    }
  `;

  constructor() {
    super();
    this.itemContextController = new ItemContextController<Result>(this, {
      parentName: 'atomic-insight-result',
      folded: false,
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    clearTimeout(this.tooltipResetTimeout);
  }

  private get result(): Result | null {
    return this.itemContextController.item;
  }

  public initialize() {
    this.actions = loadInsightAnalyticsActions(this.bindings.engine);
    this.currentTooltip = this.tooltip;
  }

  private onClick() {
    if (!this.result) {
      return;
    }

    if (this.tooltipOnClick) {
      const originalTooltip = this.tooltip;
      this.currentTooltip = this.tooltipOnClick;
      clearTimeout(this.tooltipResetTimeout);
      this.tooltipResetTimeout = setTimeout(() => {
        this.currentTooltip = originalTooltip;
      }, 1000);
    }

    switch (this.action) {
      case Actions.CopyToClipboard:
        this.bindings.engine.dispatch(
          this.actions.logCopyToClipboard(this.result)
        );
        navigator.clipboard.writeText(this.result.clickUri);
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

    this.dispatchEvent(
      new CustomEvent<InsightResultActionClickedEvent>(
        'atomicInsightResultActionClicked',
        {
          bubbles: true,
          composed: true,
          cancelable: true,
          detail: {action: this.action, result: this.result},
        }
      )
    );
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

  @errorGuard()
  @bindingGuard()
  render() {
    if (!this.result) {
      return null;
    }

    return renderIconButton({
      props: {
        partPrefix: 'result-action',
        style: 'outline-neutral',
        icon: this.getIcon(),
        title: this.currentTooltip,
        onClick: () => this.onClick(),
      },
    });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-insight-result-action': AtomicInsightResultAction;
  }
}
