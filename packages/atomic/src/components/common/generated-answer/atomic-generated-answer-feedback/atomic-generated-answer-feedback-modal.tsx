import {
  GeneratedAnswer,
  GeneratedAnswerFeedback,
  GeneratedAnswerFeedbackOption,
} from '@coveo/headless';
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
import CloseIcon from '../../../../images/close.svg';
import Success from '../../../../images/success.svg';
import {
  InitializableComponent,
  InitializeBindings,
} from '../../../../utils/initialization-utils';
import {updateBreakpoints} from '../../../../utils/replace-breakpoint-utils';
import {once, randomID} from '../../../../utils/utils';
import {ATOMIC_MODAL_EXPORT_PARTS} from '../../atomic-modal/export-parts';
import {IconButton} from '../../stencil-iconButton';
import {AnyBindings} from '../../interface/bindings';
import {Button} from '../../stencil-button';
import {FieldsetGroup} from '../../stencil-fieldset-group';
import {RadioButton} from '../../stencil-radio-button';

/**
 * Internal component, only to use through `atomic-generated-answer` or `atomic-insight-generated-answer`
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
  /**
   * Indicates whether the answer was helpful or not.
   */
  @Prop({reflect: true, mutable: true}) helpful = false;

  @State() public error!: Error;
  @State() private currentAnswer: Partial<GeneratedAnswerFeedback> =
    this.getInitialAnswerState();
  @State() feedbackSubmitted: boolean = false;
  @State() answerEvaluationRequired: boolean = false;

  private readonly formId = randomID(
    'atomic-generated-answer-feedback-modal-form-'
  );
  private detailsInputRef?: HTMLTextAreaElement;

  private linkInputRef?: HTMLInputElement;

  @Event() feedbackSent!: EventEmitter;

  @Watch('isOpen')
  watchToggleOpen(isOpen: boolean) {
    if (isOpen) {
      this.generatedAnswer.openFeedbackModal();
    }
  }

  private static options: {
    localeKey: string;
    correspondingAnswer: keyof GeneratedAnswerFeedback;
  }[] = [
    {
      localeKey: 'feedback-correct-topic',
      correspondingAnswer: 'correctTopic',
    },
    {
      localeKey: 'feedback-hallucination-free',
      correspondingAnswer: 'hallucinationFree',
    },
    {
      localeKey: 'feedback-documented',
      correspondingAnswer: 'documented',
    },
    {
      localeKey: 'feedback-readable',
      correspondingAnswer: 'readable',
    },
  ];

  private getInitialAnswerState(): Partial<GeneratedAnswerFeedback> {
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
    this.isOpen = false;
  }

  private clearInputRefs() {
    if (this.detailsInputRef) {
      this.detailsInputRef.value = '';
    }
    if (this.linkInputRef) {
      this.linkInputRef.value = '';
    }
  }

  private close() {
    this.clearInputRefs();
    this.resetState();
    this.generatedAnswer.closeFeedbackModal();
  }

  private updateBreakpoints = once(() => updateBreakpoints(this.host));

  private setCurrentAnswer(
    key: keyof GeneratedAnswerFeedback,
    value: GeneratedAnswerFeedbackOption | string
  ) {
    this.currentAnswer = {
      ...this.currentAnswer,
      [key]: value,
    };
  }

  public sendFeedback() {
    const feedback: GeneratedAnswerFeedback = {
      ...(this.currentAnswer as GeneratedAnswerFeedback),
      helpful: this.helpful,
    };
    this.generatedAnswer.sendFeedback(feedback);
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
        class="flex w-full items-center justify-between"
      >
        <h1>
          <span>{this.bindings.i18n.t('feedback-modal-title')}</span>
          <span class="hide ml-0.5">
            {this.bindings.i18n.t('additional-feedback')}
          </span>
        </h1>
        <IconButton
          style="text-transparent"
          class="search-clear-button"
          onClick={() => this.close()}
          icon={CloseIcon}
          partPrefix={'close'}
          ariaLabel={this.bindings.i18n.t('close')}
        />
      </div>
    );
  }

  private renderFeedbackOption(
    option: GeneratedAnswerFeedbackOption,
    correspondingAnswer: keyof GeneratedAnswerFeedback
  ) {
    const buttonClasses = [
      'min-w-20',
      'flex',
      'items-center',
      'justify-center',
      'px-3',
      'py-1.5',
      'mr-1',
      'text-neutral-dark',
    ];
    const isSelected = this.currentAnswer[correspondingAnswer] === option;

    if (isSelected) {
      buttonClasses.push('active');
    }
    return (
      <RadioButton
        key={String(correspondingAnswer)}
        groupName={this.bindings.i18n.t(correspondingAnswer)}
        style="outline-neutral"
        checked={isSelected}
        aria-checked={isSelected}
        onChecked={() => {
          this.setCurrentAnswer(correspondingAnswer, option);
        }}
        class={buttonClasses.join(' ')}
        text={this.bindings.i18n.t(option)}
      ></RadioButton>
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
          <label class="text-base">
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
        <legend class="font-bold">
          {this.bindings.i18n.t('answer-evaluation')}
        </legend>
        {AtomicGeneratedAnswerFeedbackModal.options.map(
          ({localeKey, correspondingAnswer}) => (
            <FieldsetGroup label={this.bindings.i18n.t(localeKey)}>
              <div
                class={`answer-evaluation mt-3 flex items-center justify-between ${String(correspondingAnswer)}`}
                key={String(correspondingAnswer)}
              >
                {this.renderAnswerEvaluation(localeKey, correspondingAnswer)}
                <div
                  class="options flex text-base"
                  aria-label={this.bindings.i18n.t(localeKey)}
                >
                  {this.renderFeedbackOption('yes', correspondingAnswer)}
                  {this.renderFeedbackOption('unknown', correspondingAnswer)}
                  {this.renderFeedbackOption('no', correspondingAnswer)}
                </div>
              </div>
            </FieldsetGroup>
          )
        )}
      </fieldset>
    );
  }

  private renderLinkToCorrectAnswerField() {
    return (
      <fieldset>
        <legend class="font-bold">
          {this.bindings.i18n.t('generated-answer-feedback-link')}
        </legend>
        <input
          type="text"
          ref={(linkInputRef) => (this.linkInputRef = linkInputRef)}
          placeholder="https://URL"
          class="input-primary placeholder-neutral-dark mt-4 h-9 w-full rounded-md px-4"
          onChange={(e) =>
            this.setCurrentAnswer(
              'documentUrl',
              (e.currentTarget as HTMLInputElement).value
            )
          }
        />
      </fieldset>
    );
  }

  private renderAddNotesField() {
    return (
      <fieldset>
        <legend class="mt-8 font-bold">
          {this.bindings.i18n.t('generated-answer-additional-notes')}
        </legend>
        <textarea
          name="answer-details"
          ref={(detailsInput) => (this.detailsInputRef = detailsInput)}
          class="placeholder-neutral-dark border-neutral hover:border-primary-light focus-visible:border-primary mt-4 w-full resize-none rounded-md border px-4 py-2 leading-5 focus:outline-hidden focus-visible:ring-2"
          rows={4}
          placeholder={this.bindings.i18n.t('add-notes')}
          onChange={(e) =>
            this.setCurrentAnswer(
              'details',
              (e.currentTarget as HTMLTextAreaElement).value
            )
          }
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
        {this.renderLinkToCorrectAnswerField()}
        {this.renderAddNotesField()}
      </form>
    );
  }

  private renderSuccessMessage() {
    return (
      <div slot="body" class="my-4 flex flex-col items-center gap-4">
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

  private renderFeedbackFormFooter() {
    const buttonClasses =
      'flex items-center justify-center text-sm leading-4 p-2 rounded-md';

    return (
      <div slot="footer" part="modal-footer">
        <div class="flex items-center justify-between">
          <div class="required-label text-base">
            <span class="text-error mr-0.5">*</span>
            {this.bindings.i18n.t('required-fields')}
          </div>
          <div class="flex gap-2">
            <Button
              part="cancel-button"
              style="outline-primary"
              class={buttonClasses}
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
              class={buttonClasses}
              ariaLabel={this.bindings.i18n.t('generated-answer-send-feedback')}
            >
              {this.bindings.i18n.t('generated-answer-send-feedback')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  private renderSuccessFormFooter() {
    return (
      <div slot="footer">
        <div class="flex justify-end gap-2 p-2">
          <Button
            part="cancel-button"
            style="primary"
            onClick={() => this.close()}
            class="flex justify-center p-2 text-sm leading-4"
            ariaLabel={this.bindings.i18n.t('modal-done')}
          >
            {this.bindings.i18n.t('modal-done')}
          </Button>
        </div>
      </div>
    );
  }

  private renderFooter() {
    if (!this.feedbackSubmitted) {
      return this.renderFeedbackFormFooter();
    } else {
      return this.renderSuccessFormFooter();
    }
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
        exportparts={ATOMIC_MODAL_EXPORT_PARTS}
      >
        {this.renderHeader()}
        {this.renderBody()}
        {this.renderFooter()}
      </atomic-modal>
    );
  }
}
