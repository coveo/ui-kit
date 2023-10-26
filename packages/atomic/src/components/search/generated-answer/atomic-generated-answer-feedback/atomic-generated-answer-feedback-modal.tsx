import {GeneratedAnswer} from '@coveo/headless';
import {GeneratedAnswerFeedback} from '@coveo/headless/dist/definitions/features/generated-answer/generated-answer-analytics-actions';
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
import {updateBreakpoints} from '../../../../utils/replace-breakpoint';
import {once, randomID} from '../../../../utils/utils';
import {Button} from '../../../common/button';
import {Bindings} from '../../atomic-search-interface/atomic-search-interface';

@Component({
  tag: 'atomic-generated-answer-feedback-modal',
  styleUrl: 'atomic-generated-answer-feedback-modal.pcss',
  shadow: true,
})
export class AtomicGeneratedAnswerFeedbackModal
  implements InitializableComponent
{
  @InitializeBindings() public bindings!: Bindings;
  @Element() public host!: HTMLElement;

  @Prop({reflect: true, mutable: true}) isOpen = false;
  @Prop() generatedAnswer!: GeneratedAnswer;

  @State() public error!: Error;
  @State() currentAnswer?: GeneratedAnswerFeedback | 'other' | undefined;
  @State() feedbackSubmitted: boolean = false;

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

  private setIsOpen(isOpen: boolean) {
    this.isOpen = isOpen;
  }

  private close() {
    this.feedbackSubmitted = false;
    this.setIsOpen(false);
    this.generatedAnswer.closeFeedbackModal();
  }

  private updateBreakpoints = once(() => updateBreakpoints(this.host));

  private setCurrentAnswer(answer?: GeneratedAnswerFeedback | 'other') {
    this.currentAnswer = answer;
  }

  public sendFeedback() {
    if (this.currentAnswer === 'other') {
      this.generatedAnswer.sendDetailedFeedback(this.detailsInputRef!.value);
    } else {
      this.generatedAnswer.sendFeedback(
        this.currentAnswer as GeneratedAnswerFeedback
      );
    }
    this.feedbackSent.emit();
  }

  private renderHeader() {
    return (
      <div
        slot="header"
        part="modalHeader"
        class="w-full p-2 flex justify-between items-center"
      >
        <h1>{this.bindings.i18n.t('generated-answer-feedback-header')}</h1>
        <Button
          style="text-transparent"
          class="search-clear-button"
          onClick={() => this.close()}
        >
          <atomic-icon icon={CloseIcon} class="w-3 my-auto m-0" />
        </Button>
      </div>
    );
  }

  private renderOptions() {
    const options: {
      id: string;
      localeKey: string;
      correspondingAnswer: GeneratedAnswerFeedback | 'other';
    }[] = [
      {
        id: 'irrelevant',
        localeKey: 'generated-answer-feedback-irrelevant',
        correspondingAnswer: 'irrelevant',
      },
      {
        id: 'notAccurate',
        localeKey: 'generated-answer-feedback-not-accurate',
        correspondingAnswer: 'notAccurate',
      },
      {
        id: 'outOfDate',
        localeKey: 'generated-answer-feedback-out-of-date',
        correspondingAnswer: 'outOfDate',
      },
      {
        id: 'harmful',
        localeKey: 'generated-answer-feedback-harmful',
        correspondingAnswer: 'harmful',
      },
      {
        id: 'other',
        localeKey: 'generated-answer-feedback-other',
        correspondingAnswer: 'other',
      },
    ];

    return (
      <fieldset>
        <legend part="reason-title" class="text-base">
          {this.bindings.i18n.t('generated-answer-feedback-instructions')}
        </legend>
        {options.map(({id, localeKey, correspondingAnswer}) => (
          <div
            class={`flex items-center ${correspondingAnswer}`}
            key={id}
            part="reason"
          >
            <input
              part="reason-radio"
              type="radio"
              name="answer"
              id={id}
              checked={this.currentAnswer === correspondingAnswer}
              onChange={(e) =>
                (e.currentTarget as HTMLInputElement | null)?.checked &&
                this.setCurrentAnswer(correspondingAnswer)
              }
              class="mr-2 w-4 h-4"
              required
            />
            <label part="reason-label" htmlFor={id}>
              {this.bindings.i18n.t(localeKey)}
            </label>
          </div>
        ))}
      </fieldset>
    );
  }

  private renderDetails() {
    if (this.currentAnswer !== 'other') {
      return;
    }

    return (
      <fieldset>
        <textarea
          part="details-input"
          name="answer-details"
          ref={(detailsInput) => (this.detailsInputRef = detailsInput)}
          class="mt-2 p-2 w-full text-base leading-5 border border-neutral resize-none rounded"
          rows={4}
          placeholder={this.bindings.i18n.t(
            'generated-answer-feedback-textarea-add-details'
          )}
          required
        ></textarea>
      </fieldset>
    );
  }

  private renderBody() {
    console.log('feedbackSubmitted', this.feedbackSubmitted);
    return !this.feedbackSubmitted ? (
      <form
        part="form"
        id={this.formId}
        slot="body"
        onSubmit={(e) => {
          e.preventDefault();
          this.sendFeedback();
        }}
        class="flex flex-col gap-8"
      >
        {this.renderOptions()}
        {this.renderDetails()}
      </form>
    ) : (
      <div slot="body" class="flex flex-col items-center">
        <atomic-icon icon={Success} class="w-48" />
        <p class="text-sm">
          {this.bindings.i18n.t('generated-answer-feedback-success')}
        </p>
      </div>
    );
  }

  private renderFooter() {
    return (
      <div slot="footer" part="modalFooter">
        {!this.feedbackSubmitted ? (
          <div part="buttons" class="flex justify-end gap-2 p-2">
            <Button
              part="cancel-button"
              style="outline-neutral"
              class="text-primary"
              onClick={() => this.close()}
            >
              {this.bindings.i18n.t('cancel')}
            </Button>
            <Button
              part="submit-button"
              style="primary"
              type="submit"
              form={this.formId}
              disabled={!this.currentAnswer ? true : false}
              onClick={() => {
                this.feedbackSubmitted = true;
              }}
            >
              {this.bindings.i18n.t('smart-snippet-feedback-send')}
            </Button>
          </div>
        ) : (
          <div part="buttons" class="flex justify-end gap-2 p-2">
            <Button
              part="cancel-button"
              style="primary"
              onClick={() => this.close()}
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
        id="rga-feedback-modal"
        isOpen={this.isOpen}
        close={() => this.close()}
        container={this.host}
        exportparts="backdrop,container,header,header-wrapper,header-ruler,body,body-wrapper,footer,footer-wrapper,footer-wrapper"
      >
        {this.renderHeader()}
        {this.renderBody()}
        {this.renderFooter()}
      </atomic-modal>
    );
  }
}
