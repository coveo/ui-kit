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
  buildSmartSnippet,
  SmartSnippet,
  SmartSnippetFeedback,
} from '@coveo/headless';
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
import {Bindings} from '../../atomic-search-interface/atomic-search-interface';

/**
 * The `atomic-smart-snippet-feedback-modal` is automatically created as a child of the `atomic-search-interface` when the `atomic-smart-snippet` is initialized.
 *
 * When the modal is opened, the class `atomic-modal-opened` is added to the body, allowing further customization.
 *
 * @part backdrop - The transparent backdrop hiding the content behind the modal.
 * @part container - The modal's outermost container with the outline and background.
 * @part header-wrapper - The wrapper around the header.
 * @part header - The header of the modal, containing the title.
 * @part header-ruler - The horizontal ruler underneath the header.
 * @part body-wrapper - The wrapper around the body.
 * @part body - The body of the modal, between the header and the footer.
 * @part form - The wrapper around the reason and details.
 * @part reason-title - The title above the reason radio buttons.
 * @part reason - A wrapper around the radio button and the label of a reason.
 * @part reason-radio - A radio button representing a reason.
 * @part reason-label - A label linked to a radio button representing a reason.
 * @part details-title - The title above the details input.
 * @part details-input - The input to specify additional details.
 * @part footer-wrapper - The wrapper with a shadow around the footer.
 * @part footer - The footer at the bottom of the modal.
 * @part buttons - The wrapper around the cancel and submit buttons.
 * @part cancel-button - The cancel button.
 * @part submit-button - The submit button.
 */
@Component({
  tag: 'atomic-smart-snippet-feedback-modal',
  styleUrl: 'atomic-smart-snippet-feedback-modal.pcss',
  shadow: true,
})
export class AtomicSmartSnippetFeedbackModal implements InitializableComponent {
  @InitializeBindings() public bindings!: Bindings;
  @Element() public host!: HTMLElement;
  public smartSnippet!: SmartSnippet;

  @State() public error!: Error;

  @Prop({mutable: true}) source?: HTMLElement;
  @Prop({reflect: true, mutable: true}) isOpen = false;

  @State() currentAnswer?: SmartSnippetFeedback | 'other' | undefined;
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
    this.smartSnippet = buildSmartSnippet(this.bindings.engine);
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
