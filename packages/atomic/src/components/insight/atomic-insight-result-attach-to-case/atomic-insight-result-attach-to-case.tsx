import {AttachToCase, buildAttachToCase, Result} from '@coveo/headless/insight';
import {
  Component,
  Event,
  Prop,
  State,
  h,
  Element,
  EventEmitter,
} from '@stencil/core';
import AttachIcon from '../../../images/attach.svg';
import DetachIcon from '../../../images/detach.svg';
import {
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {IconButton} from '../../common/iconButton';
import {ResultContext} from '../../search/result-template-components/result-template-decorators';
import {InsightBindings} from '../atomic-insight-interface/atomic-insight-interface';

export interface InsightResultAttachToCaseEvent {
  controller: AttachToCase;
  result: Result;
}
/**
 * @internal
 */
@Component({
  tag: 'atomic-insight-result-attach-to-case',
  styleUrl: 'atomic-insight-result-attach-to-case.pcss',
})
export class AtomicInsightResultAttachToCase
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

  /**
   * Whether the component should only behave as a visual indicator that a result is attached to the current case. Defaults to `false`, meaning that the component is interactive by default.
   */
  @Prop()
  public readOnly: boolean = false;

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
      this.detach.emit({controller: this.attachToCase, result: this.result});
    } else {
      this.attach.emit({controller: this.attachToCase, result: this.result});
    }
  }

  private getIcon() {
    if (this.attachToCase.isAttached() && this.readOnly) {
      return AttachIcon;
    }
    return this.attachToCase.isAttached() ? DetachIcon : AttachIcon;
  }

  private getTooltip() {
    if (this.attachToCase.isAttached() && this.readOnly) {
      return this.bindings.i18n.t('result-is-attached');
    }
    return this.attachToCase.isAttached()
      ? this.bindings.i18n.t('detach-from-case')
      : this.bindings.i18n.t('attach-to-case');
  }

  public render() {
    if (!this.readOnly) {
      return (
        <IconButton
          partPrefix="result-action"
          style="outline-neutral"
          icon={this.getIcon()}
          title={this.getTooltip()}
          onClick={() => this.onClick()}
        />
      );
    } else if (this.attachToCase.isAttached() && this.readOnly) {
      return (
        <atomic-icon
          part="icon"
          class="flex w-5 justify-center"
          icon={this.getIcon()}
          title={this.getTooltip()}
        ></atomic-icon>
      );
    }
  }
}
