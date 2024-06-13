import {GeneratedAnswer} from '@coveo/headless';
import {
  Component,
  State,
  h,
  Watch,
  Prop,
  Element,
  Event,
  EventEmitter,
} from '@stencil/core/internal';
import {AnyBindings} from '../../../../components';
import CloseIcon from '../../../../images/close.svg';
import Success from '../../../../images/success.svg';
import {
  InitializableComponent,
  InitializeBindings,
} from '../../../../utils/initialization-utils';
import {updateBreakpoints} from '../../../../utils/replace-breakpoint';
import {once, randomID} from '../../../../utils/utils';
import {Button} from '../../button';
import {IconButton} from '../../iconButton';

type GeneratedAnswerFeedbackOption = 'yes' | 'unknown' | 'no';

type GeneratedAnswerFeedback = {
  documented?: GeneratedAnswerFeedbackOption;
  correctTopic?: GeneratedAnswerFeedbackOption;
  hallucinationFree?: GeneratedAnswerFeedbackOption;
  readable?: GeneratedAnswerFeedbackOption;
};

/**
 * @internal
 */
@Component({
  tag: 'atomic-generated-answer-feedback-modal',
  styleUrl: 'atomic-generated-answer-feedback-modal.pcss',
  shadow: true,
})
export class AtomicGeneratedAnswerFeedbackModal
  implements InitializableComponent<AnyBindings>
{
  @InitializeBindings() public bindings!: AnyBindings;
  @Element() public host!: HTMLElement;

  /**
   * Indicates whether the modal is open.
   */
  @Prop({reflect: true, mutable: true}) isOpen = false;
  /**
   * A `GeneratedAnswer` controller instance. It is used when the user interacts with the modal.
   */
  @Prop({reflect: true, mutable: true}) generatedAnswer!: GeneratedAnswer;

  @State() public error!: Error;
  @State() private currentAnswer: GeneratedAnswerFeedback =
    this.getInitialAnswerState();
  @State() feedbackSubmitted: boolean = false;
  @State() answerEvaluationRequired: boolean = false;

  private readonly formId = randomID(
    'atomic-generated-answer-feedback-modal-form-'
  );
  private detailsInputRef?: HTMLTextAreaElement;

  @Event() feedbackSent!: EventEmitter;

  @Watch('isOpen')
  watchToggleOpen(isOpen: boolean) {
    if (isOpen) {
      this.generatedAnswer.openFeedbackModal();
    }
  }

  private static options: {
    id: string;
    localeKey: string;
    correspondingAnswer: keyof GeneratedAnswerFeedback;
  }[] = [
    {
      id: 'correctTopic',
      localeKey: 'feedback-correct-topic',
      correspondingAnswer: 'correctTopic',
    },
    {
      id: 'hallucinationFree',
      localeKey: 'feedback-hallucination-free',
      correspondingAnswer: 'hallucinationFree',
    },
    {
      id: ' documented',
      localeKey: 'feedback-documented',
      correspondingAnswer: 'documented',
    },
    {
      id: 'readable',
      localeKey: 'feedback-readable',
      correspondingAnswer: 'readable',
    },
  ];

  private getInitialAnswerState(): GeneratedAnswerFeedback {
    return {
      documented: undefined,
      correctTopic: undefined,
      hallucinationFree: undefined,
      readable: undefined,
    };
  }

  private resetState() {
    this.feedbackSubmitted = false;
    this.currentAnswer = this.getInitialAnswerState();
    this.answerEvaluationRequired = false;
    this.setIsOpen(false);
  }

  private setIsOpen(isOpen: boolean) {
    this.isOpen = isOpen;
  }

  private close() {
    if (this.detailsInputRef) {
      this.detailsInputRef.value = '';
    }
    this.resetState();
    this.generatedAnswer.closeFeedbackModal();
  }

  private updateBreakpoints = once(() => updateBreakpoints(this.host));

  private setCurrentAnswer(
    key: keyof GeneratedAnswerFeedback,
    value: GeneratedAnswerFeedbackOption
  ) {
    this.currentAnswer = {
      ...this.currentAnswer,
      [key]: value,
    };
  }

  public sendFeedback() {
    // if (this.currentAnswer === 'other') {
    //   this.generatedAnswer.sendDetailedFeedback(this.detailsInputRef!.value);
    // } else {
    //   this.generatedAnswer.sendFeedback(
    //     this.currentAnswer as GeneratedAnswerFeedback
    //   );
    // }
    this.feedbackSent.emit();
  }

  private isAnyAnswerEvaluationUndefined = () => {
    return Object.values(this.currentAnswer).some(
      (value) => value === undefined
    );
  };

  private handleSubmit(e: Event) {
    e.preventDefault();
    if (this.isAnyAnswerEvaluationUndefined()) {
      this.answerEvaluationRequired = true;
      return;
    }
    this.feedbackSubmitted = true;
    this.answerEvaluationRequired = false;
    this.sendFeedback();
  }

  private renderHeader() {
    return (
      <div
        slot="header"
        part="modal-header"
        class="w-full flex justify-between items-center"
      >
        <h1>
          <span>{this.bindings.i18n.t('feedback-modal-title')}</span>
          <span class="ml-0.5 hide">
            {this.bindings.i18n.t('additional-feedback')}
          </span>
        </h1>
        <IconButton
          style="text-transparent"
          class="search-clear-button"
          onClick={() => this.close()}
          icon={CloseIcon}
          partPrefix={'close'}
          ariaLabel={this.bindings.i18n.t('modal-done')}
        />
      </div>
    );
  }

  private renderFeedbackOption(
    option: GeneratedAnswerFeedbackOption,
    correspondingAnswer: keyof GeneratedAnswerFeedback
  ) {
    const buttonClasses = [
      'flex',
      'items-center',
      'px-3',
      'py-2',
      'mr-1',
      'text-neutral-dark',
    ];
    const isActive = this.currentAnswer[correspondingAnswer] === option;

    if (isActive) {
      buttonClasses.push('active');
    }
    return (
      <Button
        part={option}
        style="outline-primary"
        class={buttonClasses.join(' ')}
        type="button"
        onClick={() => this.setCurrentAnswer(correspondingAnswer, option)}
        ariaPressed={String(isActive)}
      >
        {this.bindings.i18n.t(option)}
      </Button>
    );
  }

  private renderAnswerEvaluation(
    label: string,
    correspondingAnswer: keyof GeneratedAnswerFeedback
  ) {
    const labelClasses = ['text-error-red', 'text-sm', 'hidden'];
    const isRequired =
      this.answerEvaluationRequired &&
      this.currentAnswer[correspondingAnswer] === undefined;
    if (isRequired) {
      labelClasses.push('required');
    }
    return (
      <div class="block">
        <div class="flex">
          <label part="reason-label text-base">
            {this.bindings.i18n.t(label)}
            <span class="text-error-red ml-0.5">*</span>
          </label>
        </div>
        <span class={labelClasses.join(' ')}>
          {this.bindings.i18n.t('required-fields-error')}
        </span>
      </div>
    );
  }

  private renderOptions() {
    return (
      <fieldset>
        <h5 class="font-bold">{this.bindings.i18n.t('answer-evaluation')}</h5>
        {AtomicGeneratedAnswerFeedbackModal.options.map(
          ({id, localeKey, correspondingAnswer}) => (
            <div
              class={`flex items-center justify-between mt-3 ${correspondingAnswer}`}
              key={id}
              part="reason"
            >
              {this.renderAnswerEvaluation(localeKey, correspondingAnswer)}
              <div class="options flex text-base">
                {this.renderFeedbackOption('yes', correspondingAnswer)}
                {this.renderFeedbackOption('unknown', correspondingAnswer)}
                {this.renderFeedbackOption('no', correspondingAnswer)}
              </div>
            </div>
          )
        )}
      </fieldset>
    );
  }

  private renderAdditionalInformation() {
    return (
      <fieldset>
        <h5 class="font-bold">
          {this.bindings.i18n.t('generated-answer-feedback-link')}
        </h5>
        <input
          type="text"
          placeholder="https://URL"
          class="input-primary mt-4 w-full h-9 rounded-md px-4 placeholder-neutral-dark"
        />

        <h5 class="mt-8 font-bold">
          {this.bindings.i18n.t('generated-answer-additional-notes')}
        </h5>
        <textarea
          part="details-input"
          name="answer-details"
          ref={(detailsInput) => (this.detailsInputRef = detailsInput)}
          class="mt-4 px-4 py-2 w-full placeholder-neutral-dark leading-5 border border-neutral resize-none rounded-md hover:border-primary-light"
          rows={4}
          placeholder={this.bindings.i18n.t('add-notes')}
        ></textarea>
      </fieldset>
    );
  }

  private renderFeedbackForm() {
    return (
      <form
        part="form"
        id={this.formId}
        slot="body"
        onSubmit={(e) => this.handleSubmit(e)}
        class="flex flex-col gap-8 leading-4"
      >
        {this.renderOptions()}
        {this.renderAdditionalInformation()}
      </form>
    );
  }

  private renderSuccessMessage() {
    return (
      <div slot="body" class="flex flex-col items-center gap-4 my-4">
        <atomic-icon icon={Success} class="w-48" />
        <p class="text-base">
          {this.bindings.i18n.t('generated-answer-feedback-success')}
        </p>
      </div>
    );
  }

  private renderBody() {
    if (!this.feedbackSubmitted) {
      return this.renderFeedbackForm();
    } else {
      return this.renderSuccessMessage();
    }
  }

  private renderFooter() {
    return (
      <div slot="footer" part="modalFooter">
        {!this.feedbackSubmitted ? (
          <div part="buttons" class="flex items-center justify-between">
            <div class="text-base required-label">
              <span class="text-error mr-0.5">*</span>
              {this.bindings.i18n.t('required-fields')}
            </div>
            <div class="flex gap-2">
              <Button
                part="cancel-button"
                style="outline-primary"
                class="flex justify-center text-sm leading-4 p-2 rounded-md"
                ariaLabel={this.bindings.i18n.t('skip')}
                onClick={() => this.close()}
              >
                {this.bindings.i18n.t('skip')}
              </Button>
              <Button
                part="submit-button"
                style="primary"
                type="submit"
                form={this.formId}
                class="flex justify-center text-sm leading-4 p-2 rounded-md"
                ariaLabel={this.bindings.i18n.t(
                  'generated-answer-send-feedback'
                )}
              >
                {this.bindings.i18n.t('generated-answer-send-feedback')}
              </Button>
            </div>
          </div>
        ) : (
          <div part="buttons" class="flex justify-end gap-2 p-2">
            <Button
              part="cancel-button"
              style="primary"
              onClick={() => this.close()}
              class="flex justify-center text-sm leading-4 p-2"
              ariaLabel={this.bindings.i18n.t('modal-done')}
            >
              {this.bindings.i18n.t('modal-done')}
            </Button>
          </div>
        )}
      </div>
    );
  }

  public render() {
    this.updateBreakpoints();

    return (
      <atomic-modal
        fullscreen={false}
        isOpen={this.isOpen}
        close={() => this.close()}
        container={this.host}
        part="generated-answer-feedback-modal"
        exportparts="backdrop,container,header,header-wrapper,header-ruler,body,body-wrapper,footer,footer-wrapper,footer-wrapper"
      >
        {this.renderHeader()}
        {this.renderBody()}
        {this.renderFooter()}
      </atomic-modal>
    );
  }
}
