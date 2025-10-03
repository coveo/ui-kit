import {AttachToCase, buildAttachToCase, Result} from '@coveo/headless/insight';
import {Component, Event, State, h, Element, EventEmitter} from '@stencil/core';
import AttachIcon from '../../../images/attach.svg';
import DetachIcon from '../../../images/detach.svg';
import {
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {IconButton} from '../../common/stencil-iconButton';
import {ResultContext} from '@/src/components/search/result-template-component-utils/context/stencil-result-template-decorators';
import {InsightBindings} from '../atomic-insight-interface/atomic-insight-interface';

export interface InsightResultAttachToCaseEvent {
  callback: () => void;
  result: Result;
}
/**
 * @internal
 * The `atomic-insight-result-attach-to-case-action` component can be nested inside a `atomic-insight-result-actions` to render an interactive button that will emit an `atomic/insight/attachToCase/attach` or `atomic/insight/attachToCase/detach` JavaScript event, based on its current state, when clicked.
 *
 * @part result-action-container - The result action container
 * @part result-action-button - The result action button
 * @part result-action-icon - The result action icon
 */
@Component({
  tag: 'atomic-insight-result-attach-to-case-action',
  styleUrl: 'atomic-insight-result-attach-to-case-action.pcss',
})
export class AtomicInsightResultAttachToCaseAction
  implements InitializableComponent<InsightBindings>
{
  @InitializeBindings() public bindings!: InsightBindings;
  @ResultContext() private result!: Result;

  @Element() host!: HTMLElement;
  @State() public error!: Error;

  public attachToCase!: AttachToCase;

  @BindStateToController('attachToCase')
  @State()
  public attachToCaseState!: {};

  @Event({
    eventName: 'atomic/insight/attachToCase/attach',
    composed: true,
    cancelable: true,
    bubbles: true,
  })
  private attach!: EventEmitter<InsightResultAttachToCaseEvent>;

  @Event({
    eventName: 'atomic/insight/attachToCase/detach',
    composed: true,
    cancelable: true,
    bubbles: true,
  })
  private detach!: EventEmitter<InsightResultAttachToCaseEvent>;

  public initialize() {
    const caseId: string =
      this.bindings.engine.state.insightCaseContext?.caseId || '';
    this.attachToCase = buildAttachToCase(this.bindings.engine, {
      options: {
        result: this.result,
        caseId: caseId,
      },
    });
  }

  private onClick() {
    if (this.attachToCase.isAttached()) {
      this.detach.emit({
        callback: this.attachToCase.detach,
        result: this.result,
      });
    } else {
      this.attach.emit({
        callback: this.attachToCase.attach,
        result: this.result,
      });
    }
  }

  private getIcon() {
    return this.attachToCase.isAttached() ? DetachIcon : AttachIcon;
  }

  private getTooltip() {
    return this.attachToCase.isAttached()
      ? this.bindings.i18n.t('detach-from-case')
      : this.bindings.i18n.t('attach-to-case');
  }

  public render() {
    return (
      <IconButton
        partPrefix="result-action"
        style="outline-neutral"
        icon={this.getIcon()}
        title={this.getTooltip()}
        onClick={() => this.onClick()}
      />
    );
  }
}
