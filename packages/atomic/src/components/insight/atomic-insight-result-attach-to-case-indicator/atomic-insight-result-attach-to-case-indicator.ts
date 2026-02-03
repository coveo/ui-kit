import {
  type AttachToCase,
  buildAttachToCase,
  type Result as InsightResult,
} from '@coveo/headless/insight';
import {html, LitElement, nothing} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {ItemContextController} from '@/src/components/common/item-list/context/item-context-controller';
import type {InsightBindings} from '@/src/components/insight/atomic-insight-interface/atomic-insight-interface';
import {bindStateToController} from '@/src/decorators/bind-state';
import {bindingGuard} from '@/src/decorators/binding-guard';
import {bindings} from '@/src/decorators/bindings';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles';
import AttachIcon from '../../../images/attach.svg';

/**
 * The `atomic-insight-result-attach-to-case-indicator` component can be included inside a result template to indicate whether a result is attached to the current case.
 *
 * @part icon - The icon that indicates whether the result is attached to the case.
 */
@customElement('atomic-insight-result-attach-to-case-indicator')
@bindings()
@withTailwindStyles
export class AtomicInsightResultAttachToCaseIndicator
  extends LitElement
  implements InitializableComponent<InsightBindings>
{
  @state() public bindings!: InsightBindings;
  @state() public error!: Error;

  public attachToCase!: AttachToCase;

  @bindStateToController('attachToCase')
  @state()
  public attachToCaseState!: Record<string, never>;

  private itemContextController: ItemContextController<InsightResult>;

  constructor() {
    super();
    this.itemContextController = new ItemContextController(this, {
      parentName: 'atomic-insight-result',
    });
  }

  public initialize() {
    const result = this.itemContextController.item;
    if (!result) {
      return;
    }

    const caseId: string =
      this.bindings.engine.state.insightCaseContext?.caseId || '';
    this.attachToCase = buildAttachToCase(this.bindings.engine, {
      options: {
        result,
        caseId,
      },
    });
  }

  @errorGuard()
  @bindingGuard()
  public render() {
    if (!this.attachToCase?.isAttached()) {
      return nothing;
    }

    return html`
      <atomic-icon
        part="icon"
        class="flex w-5 justify-center"
        .icon=${AttachIcon}
        title=${this.bindings.i18n.t('result-is-attached')}
      ></atomic-icon>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-insight-result-attach-to-case-indicator': AtomicInsightResultAttachToCaseIndicator;
  }
}
