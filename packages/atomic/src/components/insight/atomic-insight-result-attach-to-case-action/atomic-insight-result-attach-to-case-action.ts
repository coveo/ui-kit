import type {AttachToCase, Result} from '@coveo/headless/insight';
import {buildAttachToCase} from '@coveo/headless/insight';
import {LitElement} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {renderIconButton} from '@/src/components/common/icon-button';
import type {InsightBindings} from '@/src/components/insight/atomic-insight-interface/atomic-insight-interface';
import {createResultContextController} from '@/src/components/search/result-template-component-utils/context/result-context-controller';
import {bindStateToController} from '@/src/decorators/bind-state';
import {bindingGuard} from '@/src/decorators/binding-guard';
import {bindings} from '@/src/decorators/bindings';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import {buildCustomEvent} from '@/src/utils/event-utils';
import AttachIcon from '../../../images/attach.svg';
import DetachIcon from '../../../images/detach.svg';

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
 *
 * @event atomic/insight/attachToCase/attach - Emitted when the button is clicked to attach a result to the case.
 * @event atomic/insight/attachToCase/detach - Emitted when the button is clicked to detach a result from the case.
 */
@customElement('atomic-insight-result-attach-to-case-action')
@bindings()
export class AtomicInsightResultAttachToCaseAction
  extends LitElement
  implements InitializableComponent<InsightBindings>
{
  @state() public bindings!: InsightBindings;
  @state() public error!: Error;

  @bindStateToController('attachToCase')
  @state()
  public attachToCaseState!: {};
  public attachToCase!: AttachToCase;

  private resultContext = createResultContextController(this);

  private get result(): Result {
    return this.resultContext.item as Result;
  }

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
      this.dispatchEvent(
        buildCustomEvent('atomic/insight/attachToCase/detach', {
          callback: this.attachToCase.detach,
          result: this.result,
        })
      );
    } else {
      this.dispatchEvent(
        buildCustomEvent('atomic/insight/attachToCase/attach', {
          callback: this.attachToCase.attach,
          result: this.result,
        })
      );
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

  @bindingGuard()
  @errorGuard()
  render() {
    return renderIconButton({
      props: {
        partPrefix: 'result-action',
        style: 'outline-neutral',
        icon: this.getIcon(),
        title: this.getTooltip(),
        onClick: () => this.onClick(),
      },
    });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-insight-result-attach-to-case-action': AtomicInsightResultAttachToCaseAction;
  }
}
