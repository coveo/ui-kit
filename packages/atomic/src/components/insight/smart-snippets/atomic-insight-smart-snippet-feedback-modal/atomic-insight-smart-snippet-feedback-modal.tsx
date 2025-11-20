import {ATOMIC_MODAL_EXPORT_PARTS} from '@/src/components/common/atomic-modal/export-parts';
import {
  SmartSnippetFeebackModalOptions,
  SmartSnippetFeedbackModalBody,
  SmartSnippetFeedbackModalDetails,
  SmartSnippetFeedbackModalFooter,
  SmartSnippetFeedbackModalHeader,
  SmartSnippetFeedbackModalOption,
  smartSnippetFeedbackOptions,
} from '@/src/components/common/smart-snippets/atomic-smart-snippet-feedback-modal/stencil-smart-snippet-feedback-modal-common';
import {updateBreakpoints} from '@/src/utils/replace-breakpoint-utils';
import {randomID} from '@/src/utils/utils';
import {
  buildSmartSnippet as buildInsightSmartSnippet,
  SmartSnippet as InsightSmartSnippet,
  SmartSnippetFeedback as InsightSmartSnippetFeedback,
  SmartSnippetFeedback,
} from '@coveo/headless/insight';
import {
  Component,
  State,
  Prop,
  Watch,
  Element,
  Event,
  EventEmitter,
  h,
} from '@stencil/core';
import {
  InitializableComponent,
  InitializeBindings,
} from '../../../../utils/initialization-utils';
import {InsightBindings} from '../../atomic-insight-interface/atomic-insight-interface';

/**
 * @internal
 */
@Component({
  tag: 'atomic-insight-smart-snippet-feedback-modal',
  styleUrl: 'atomic-insight-smart-snippet-feedback-modal.pcss',
  shadow: true,
})
export class AtomicInsightSmartSnippetFeedbackModal
  implements InitializableComponent<InsightBindings>
{
  @InitializeBindings() public bindings!: InsightBindings;
  @Element() public host!: HTMLElement;
  public smartSnippet!: InsightSmartSnippet;

  @State() public error!: Error;

  @Prop({mutable: true}) source?: HTMLElement;
  @Prop({reflect: true, mutable: true}) isOpen = false;

  @State() currentAnswer?: InsightSmartSnippetFeedback | 'other' | undefined;
  private detailsInputRef?: HTMLTextAreaElement;
  private readonly formId = randomID(
    'atomic-smart-snippet-feedback-modal-form-'
  );

  @Event() feedbackSent!: EventEmitter;

  @Watch('isOpen')
  watchToggleOpen(isOpen: boolean) {
    if (isOpen) {
      this.smartSnippet.openFeedbackModal();
      this.currentAnswer = undefined;
    }
  }

  initialize() {
    this.smartSnippet = buildInsightSmartSnippet(this.bindings.engine);
  }

  public render() {
    updateBreakpoints(this.host);

    return (
      <atomic-modal
        fullscreen={false}
        source={this.source}
        container={this.host}
        isOpen={this.isOpen}
        close={() => this.close()}
        exportparts={ATOMIC_MODAL_EXPORT_PARTS}
      >
        <SmartSnippetFeedbackModalHeader i18n={this.bindings.i18n} />
        <SmartSnippetFeedbackModalBody
          formId={this.formId}
          onSubmit={(e: Event) => this.sendFeedback(e)}
        >
          <SmartSnippetFeebackModalOptions i18n={this.bindings.i18n}>
            {smartSnippetFeedbackOptions.map(
              ({id, localeKey, correspondingAnswer}) => (
                <SmartSnippetFeedbackModalOption
                  correspondingAnswer={correspondingAnswer}
                  currentAnswer={this.currentAnswer}
                  i18n={this.bindings.i18n}
                  id={id}
                  localeKey={localeKey}
                  onChange={() => {
                    this.currentAnswer = correspondingAnswer;
                  }}
                />
              )
            )}
          </SmartSnippetFeebackModalOptions>
          <SmartSnippetFeedbackModalDetails
            currentAnswer={this.currentAnswer}
            i18n={this.bindings.i18n}
            setDetailsInputRef={(ref) => (this.detailsInputRef = ref)}
          />
        </SmartSnippetFeedbackModalBody>
        <SmartSnippetFeedbackModalFooter
          formId={this.formId}
          i18n={this.bindings.i18n}
          onClick={() => this.close()}
        />
      </atomic-modal>
    );
  }

  private close() {
    this.isOpen = false;
    this.smartSnippet.closeFeedbackModal();
  }

  private sendFeedback(e: Event) {
    e.preventDefault();

    if (this.currentAnswer === 'other') {
      this.smartSnippet.sendDetailedFeedback(this.detailsInputRef!.value);
    } else {
      this.smartSnippet.sendFeedback(
        this.currentAnswer as SmartSnippetFeedback
      );
    }
    this.feedbackSent.emit();
    this.isOpen = false;
  }
}
