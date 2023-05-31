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
} from '@stencil/core';
import {
  InitializableComponent,
  InitializeBindings,
} from '../../../../utils/initialization-utils';
import {randomID} from '../../../../utils/utils';
import {SmartSnippetFeedbackModalCommon} from '../../../common/smart-snippets/atomic-smart-snippet-feedback-modal/smart-snippet-feedback-modal-common';
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

  private smartSnippetFeedbackModalCommon!: SmartSnippetFeedbackModalCommon;

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
    this.smartSnippetFeedbackModalCommon = new SmartSnippetFeedbackModalCommon({
      formId: this.formId,
      getHost: () => this.host,
      getBindings: () => this.bindings,
      getCurrentAnswer: () => this.currentAnswer,
      getSmartSnippet: () => this.smartSnippet,
      getDetailsInputRef: () => this.detailsInputRef,
      getFeedbackSent: () => this.feedbackSent,
      getSource: () => this.source,
      getIsOpen: () => this.isOpen,
      setIsOpen: this.setIsOpen.bind(this),
      setCurrentAnswer: this.setCurrentAnswer.bind(this),
      setDetailsInputRef: this.setDetailsInputRef.bind(this),
    });
  }

  private setIsOpen(isOpen: boolean) {
    this.isOpen = isOpen;
  }

  private setCurrentAnswer(answer: SmartSnippetFeedback | 'other') {
    this.currentAnswer = answer;
  }

  private setDetailsInputRef(ref?: HTMLTextAreaElement) {
    this.detailsInputRef = ref;
  }

  public render() {
    return this.smartSnippetFeedbackModalCommon.render();
  }
}
