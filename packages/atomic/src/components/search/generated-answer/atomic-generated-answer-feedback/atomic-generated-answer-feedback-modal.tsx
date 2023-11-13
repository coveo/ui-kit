import {GeneratedAnswer, GeneratedAnswerFeedback} from '@coveo/headless';
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
import {capitalize} from 'lodash';
import CloseIcon from '../../../../images/close.svg';
import Success from '../../../../images/success.svg';
import {
  InitializableComponent,
  InitializeBindings,
} from '../../../../utils/initialization-utils';
import {updateBreakpoints} from '../../../../utils/replace-breakpoint';
import {once, randomID} from '../../../../utils/utils';
import {Button} from '../../../common/button';
import {IconButton} from '../../../common/iconButton';
import {Bindings} from '../../atomic-search-interface/atomic-search-interface';

/**
 * @internal
 */
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
  @Prop({reflect: true, mutable: true}) generatedAnswer!: GeneratedAnswer;

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

  private static options: {
    id: string;
    localeKey: string;
    correspondingAnswer: GeneratedAnswerFeedback | 'other';
  }[] = [
    {
      id: 'irrelevant',
      localeKey: 'irrelevant',
      correspondingAnswer: 'irrelevant',
    },
    {
      id: 'notAccurate',
      localeKey: 'not-accurate',
      correspondingAnswer: 'notAccurate',
    },
    {
      id: 'outOfDate',
      localeKey: 'out-of-date',
      correspondingAnswer: 'outOfDate',
    },
    {
      id: 'harmful',
      localeKey: 'harmful',
      correspondingAnswer: 'harmful',
    },
    {
      id: 'other',
      localeKey: 'other',
      correspondingAnswer: 'other',
    },
  ];

  private setIsOpen(isOpen: boolean) {
    this.isOpen = isOpen;
  }

  private close() {
    this.feedbackSubmitted = false;
    if (this.detailsInputRef) {
      this.detailsInputRef.value = '';
    }
    this.currentAnswer = undefined;
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
        part="modal-header"
        class="w-full p-2 flex justify-between items-center"
      >
        <h1>{this.bindings.i18n.t('feedback')}</h1>
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

  private renderOptions() {
    return (
      <fieldset>
        <legend part="reason-title" class="text-base">
          {this.bindings.i18n.t('generated-answer-feedback-instructions')}
        </legend>
        {AtomicGeneratedAnswerFeedbackModal.options.map(
          ({id, localeKey, correspondingAnswer}) => (
            <div
              class={`flex items-center ${correspondingAnswer} mobile-only:mt-4 desktop-only:mt-6`}
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
          )
        )}
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
          {capitalize(this.bindings.i18n.t('details'))}
        </legend>
        <textarea
          part="details-input"
          name="answer-details"
          ref={(detailsInput) => (this.detailsInputRef = detailsInput)}
          class="mt-2 p-2 w-full text-base leading-5 border border-neutral resize-none rounded"
          rows={4}
          placeholder={this.bindings.i18n.t('add-details')}
          required
        ></textarea>
      </fieldset>
    );
  }

  private renderBody() {
    return !this.feedbackSubmitted ? (
      <form
        part="form"
        id={this.formId}
        slot="body"
        onSubmit={(e) => {
          e.preventDefault();
          this.sendFeedback();
        }}
        class="flex flex-col gap-8 text-base leading-4 text-neutral-dark p-2"
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
              class="text-primary flex justify-center text-sm leading-4 p-2"
              ariaLabel={this.bindings.i18n.t('cancel')}
              onClick={() => this.close()}
            >
              {this.bindings.i18n.t('cancel')}
            </Button>
            <Button
              part="submit-button"
              style="primary"
              type="submit"
              form={this.formId}
              class="flex justify-center text-sm leading-4 p-2"
              disabled={!this.currentAnswer}
              ariaLabel={this.bindings.i18n.t('feedback-send')}
              onClick={() => {
                this.feedbackSubmitted = true;
              }}
            >
              {this.bindings.i18n.t('send')}
            </Button>
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
        exportparts="backdrop,container,header,header-wrapper,header-ruler,body,body-wrapper,footer,footer-wrapper,footer-wrapper"
      >
        {this.renderHeader()}
        {this.renderBody()}
        {this.renderFooter()}
      </atomic-modal>
    );
  }
}
