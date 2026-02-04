import {
  type AttachToCase,
  buildAttachToCase,
  type Result,
} from '@coveo/headless/insight';
import {html, LitElement} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {renderIconButton} from '@/src/components/common/icon-button';
import {
  ItemContextController,
  type ItemContextEvent,
} from '@/src/components/common/item-list/context/item-context-controller';
import type {InsightBindings} from '@/src/components/insight/atomic-insight-interface/atomic-insight-interface';
import {bindStateToController} from '@/src/decorators/bind-state';
import {bindingGuard} from '@/src/decorators/binding-guard';
import {bindings} from '@/src/decorators/bindings';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles';
import AttachIcon from '../../../images/attach.svg';
import DetachIcon from '../../../images/detach.svg';

export interface InsightResultAttachToCaseEvent {
  callback: () => void;
  result: Result;
}

/**
 * The `atomic-insight-result-attach-to-case-action` component can be nested inside a `atomic-insight-result-actions` to render an interactive button that will emit an `atomic/insight/attachToCase/attach` or `atomic/insight/attachToCase/detach` JavaScript event, based on its current state, when clicked.
 *
 * @part result-action-container - The result action container
 * @part result-action-button - The result action button
 * @part result-action-icon - The result action icon
 */
@customElement('atomic-insight-result-attach-to-case-action')
@withTailwindStyles
@bindings()
export class AtomicInsightResultAttachToCaseAction
  extends LitElement
  implements InitializableComponent<InsightBindings>
{
  @state() public bindings!: InsightBindings;
  @state() public error!: Error;

  public attachToCase!: AttachToCase;

  @bindStateToController('attachToCase')
  @state()
  private attachToCaseState!: Record<string, never>;

  private itemContextController!: ItemContextController<Result>;

  constructor() {
    super();
    this.itemContextController = new ItemContextController<Result>(this, {
      parentName: 'atomic-insight-result',
      folded: false,
    });
  }

  private get result(): Result | null {
    return this.itemContextController.item;
  }

  public initialize() {
    if (!this.result) {
      return;
    }

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
    if (!this.result) {
      return;
    }

    if (this.attachToCase.isAttached()) {
      this.dispatchEvent(
        new CustomEvent<InsightResultAttachToCaseEvent>(
          'atomic/insight/attachToCase/detach',
          {
            bubbles: true,
            composed: true,
            cancelable: true,
            detail: {
              callback: this.attachToCase.detach,
              result: this.result,
            },
          }
        )
      );
    } else {
      this.dispatchEvent(
        new CustomEvent<InsightResultAttachToCaseEvent>(
          'atomic/insight/attachToCase/attach',
          {
            bubbles: true,
            composed: true,
            cancelable: true,
            detail: {
              callback: this.attachToCase.attach,
              result: this.result,
            },
          }
        )
      );
    }
  }

  private getIcon() {
    return this.attachToCase?.isAttached() ? DetachIcon : AttachIcon;
  }

  private getTooltip() {
    return this.attachToCase?.isAttached()
      ? this.bindings.i18n.t('detach-from-case')
      : this.bindings.i18n.t('attach-to-case');
  }

  @errorGuard()
  @bindingGuard()
  render() {
    void this.attachToCaseState;

    if (!this.result || !this.attachToCase) {
      return html``;
    }

    return renderIconButton({
      props: {
        partPrefix: 'result-action',
        style: 'outline-neutral',
        icon: this.getIcon(),
        ariaLabel: this.getTooltip(),
        title: this.getTooltip(),
        onClick: () => this.onClick(),
      },
    });
  }
}

export type ResultContextEvent = ItemContextEvent<Result>;

declare global {
  interface HTMLElementTagNameMap {
    'atomic-insight-result-attach-to-case-action': AtomicInsightResultAttachToCaseAction;
  }
}
