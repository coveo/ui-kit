import {AttachToCase, buildAttachToCase, Result} from '@coveo/headless/insight';
import {Component, State, h, Element} from '@stencil/core';
import AttachIcon from '../../../images/attach.svg';
import {
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {ResultContext} from '@/src/components/search/result-template-component-utils/context/stencil-result-template-decorators';
import {InsightBindings} from '../atomic-insight-interface/atomic-insight-interface';

/**
 * @internal
 * The `atomic-insight-result-attach-to-case-indicator` component can be included inside a result template to indicate whether a result is attached to the current case.
 *
 * @part icon The icon that indicates whether the result is attached to the case.
 */
@Component({
  tag: 'atomic-insight-result-attach-to-case-indicator',
  styleUrl: 'atomic-insight-result-attach-to-case-indicator.pcss',
})
export class AtomicInsightResultAttachToCaseIndicator
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

  public render() {
    if (this.attachToCase.isAttached()) {
      return (
        <atomic-icon
          part="icon"
          class="flex w-5 justify-center"
          icon={AttachIcon}
          title={this.bindings.i18n.t('result-is-attached')}
        ></atomic-icon>
      );
    }
  }
}
