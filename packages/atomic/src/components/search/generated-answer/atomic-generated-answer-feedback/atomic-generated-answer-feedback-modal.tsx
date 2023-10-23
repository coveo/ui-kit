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
    this.setIsOpen(false);
  }

  private renderHeader() {
    return (
      <h1 slot="header">
        {this.bindings.i18n.t('smart-snippet-feedback-explain-why')}
      </h1>
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
        localeKey: 'smart-snippet-feedback-reason-does-not-answer',
        correspondingAnswer: 'irrelevant',
      },
      {
        id: 'notAccurate',
        localeKey: 'smart-snippet-feedback-reason-partially-answers',
        correspondingAnswer: 'notAccurate',
      },
      {
        id: 'outOfDate',
        localeKey: 'smart-snippet-feedback-reason-was-not-a-question',
        correspondingAnswer: 'outOfDate',
      },
      {
        id: 'harmful',
        localeKey: 'smart-snippet-feedback-reason-other',
        correspondingAnswer: 'harmful',
      },
    ];

    return (
      <fieldset>
        <legend
          part="reason-title"
          class="font-bold text-on-background text-lg"
        >
          {this.bindings.i18n.t('smart-snippet-feedback-select-reason')}
        </legend>
        {options.map(({id, localeKey, correspondingAnswer}) => (
          <div class="flex items-center" key={id} part="reason">
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
        <legend
          part="details-title"
          class="font-bold text-on-background text-lg"
        >
          {this.bindings.i18n.t('smart-snippet-feedback-details')}
        </legend>
        <textarea
          part="details-input"
          name="answer-details"
          ref={(detailsInput) => (this.detailsInputRef = detailsInput)}
          class="mt-2 p-2 w-full text-base leading-5 border border-neutral resize-none rounded"
          rows={4}
          required
        ></textarea>
      </fieldset>
    );
  }

  private renderBody() {
    return (
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
    );
  }

  private renderFooter() {
    return (
      <div part="buttons" slot="footer" class="flex justify-end gap-2">
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
        >
          {this.bindings.i18n.t('smart-snippet-feedback-send')}
        </Button>
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
