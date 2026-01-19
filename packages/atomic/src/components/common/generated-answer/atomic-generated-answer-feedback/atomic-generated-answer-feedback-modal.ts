import '@/src/components/common/atomic-modal/atomic-modal';
import type {
  GeneratedAnswer,
  GeneratedAnswerFeedback,
  GeneratedAnswerFeedbackOption,
} from '@coveo/headless';
import {css, html, LitElement} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {createRef, type Ref} from 'lit/directives/ref.js';
import {ATOMIC_MODAL_EXPORT_PARTS} from '@/src/components/common/atomic-modal/export-parts';
import {renderButton} from '@/src/components/common/button';
import {renderFieldsetGroup} from '@/src/components/common/fieldset-group';
import {renderIconButton} from '@/src/components/common/icon-button';
import type {AnyBindings} from '@/src/components/common/interface/bindings';
import {renderRadioButton} from '@/src/components/common/radio-button';
import {booleanConverter} from '@/src/converters/boolean-converter';
import {bindings} from '@/src/decorators/bindings';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import {watch} from '@/src/decorators/watch';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles';
import {tw} from '@/src/directives/multi-class-map';
import {updateBreakpoints} from '@/src/utils/replace-breakpoint-utils';
import {once, randomID} from '@/src/utils/utils';
import CloseIcon from '../../../../images/close.svg';
import Success from '../../../../images/success.svg';

/**
 * Internal component, only to use through `atomic-generated-answer` or `atomic-insight-generated-answer`
 *
 * @part backdrop - The transparent backdrop hiding the content behind the modal.
 * @part container - The modal's outermost container with the outline and background.
 * @part modal-header - The modal header container.
 * @part close-button-wrapper - The wrapper around the close button.
 * @part close-button - The close button.
 * @part form - The feedback form.
 * @part modal-footer - The modal footer container.
 * @part cancel-button - The cancel/skip button.
 * @part submit-button - The submit button.
 */
@customElement('atomic-generated-answer-feedback-modal')
@bindings()
@withTailwindStyles
export class AtomicGeneratedAnswerFeedbackModal
  extends LitElement
  implements InitializableComponent<AnyBindings>
{
  static styles = css`
    @reference '../../../../utils/tailwind.global.tw.css';
  `;

  @state()
  bindings!: AnyBindings;

  @state()
  error!: Error;

  /**
   * Indicates whether the modal is open.
   */
  @property({
    type: Boolean,
    reflect: true,
    attribute: 'is-open',
    converter: booleanConverter,
  })
  isOpen = false;

  /**
   * A `GeneratedAnswer` controller instance. It is used when the user interacts with the modal.
   */
  @property({type: Object, attribute: false})
  generatedAnswer!: GeneratedAnswer;

  /**
   * Indicates whether the answer was helpful or not.
   */
  @property({type: Boolean, reflect: true})
  helpful = false;

  @state()
  private currentAnswer: Partial<GeneratedAnswerFeedback> =
    this.getInitialAnswerState();

  @state()
  private feedbackSubmitted = false;

  @state()
  private answerEvaluationRequired = false;

  private readonly formId = randomID(
    'atomic-generated-answer-feedback-modal-form-'
  );
  private detailsInputRef: Ref<HTMLTextAreaElement> = createRef();
  private linkInputRef: Ref<HTMLInputElement> = createRef();
  private updateBreakpoints = once(() => updateBreakpoints(this));

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

  @watch('isOpen')
  watchToggleOpen(isOpen: boolean) {
    if (isOpen) {
      this.generatedAnswer.openFeedbackModal();
    }
  }

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
    if (this.detailsInputRef.value) {
      this.detailsInputRef.value.value = '';
    }
    if (this.linkInputRef.value) {
      this.linkInputRef.value.value = '';
    }
  }

  private close() {
    this.clearInputRefs();
    this.resetState();
    this.generatedAnswer.closeFeedbackModal();
  }

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
    this.dispatchEvent(new CustomEvent('feedbackSent'));
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
    return html`
      <div
        slot="header"
        part="modal-header"
        class=${tw('flex w-full items-center justify-between')}
      >
        <h1>
          <span>${this.bindings.i18n.t('feedback-modal-title')}</span>
          <span class=${tw('hide ml-0.5')}>
            ${this.bindings.i18n.t('additional-feedback')}
          </span>
        </h1>
        ${renderIconButton({
          props: {
            style: 'text-transparent',
            class: 'search-clear-button',
            onClick: () => this.close(),
            icon: CloseIcon,
            partPrefix: 'close',
            ariaLabel: this.bindings.i18n.t('close'),
          },
        })}
      </div>
    `;
  }

  private renderFeedbackOption(
    option: GeneratedAnswerFeedbackOption,
    correspondingAnswer: keyof GeneratedAnswerFeedback
  ) {
    const isSelected = this.currentAnswer[correspondingAnswer] === option;

    return renderRadioButton({
      props: {
        key: String(correspondingAnswer),
        groupName: this.bindings.i18n.t(correspondingAnswer),
        style: 'outline-neutral',
        checked: isSelected,
        'aria-checked': isSelected,
        onChecked: () => {
          this.setCurrentAnswer(correspondingAnswer, option);
        },
        class: tw(
          'min-w-20 flex items-center justify-center px-3 py-1.5 mr-1 text-neutral-dark',
          {active: isSelected}
        ),
        text: this.bindings.i18n.t(option),
      },
    });
  }

  private renderAnswerEvaluation(
    label: string,
    correspondingAnswer: keyof GeneratedAnswerFeedback
  ) {
    const isRequired =
      this.answerEvaluationRequired &&
      this.currentAnswer[correspondingAnswer] === undefined;

    return html`
      <div class=${tw('block')}>
        <div class=${tw('flex')}>
          <label class=${tw('text-base')}>
            ${this.bindings.i18n.t(label)}
            <span class=${tw('text-error-red ml-0.5')}>*</span>
          </label>
        </div>
        <span
          class=${tw('text-error-red text-sm hidden', {required: isRequired})}
        >
          ${this.bindings.i18n.t('required-fields-error')}
        </span>
      </div>
    `;
  }

  private renderOptions() {
    return html`
      <fieldset>
        <legend class=${tw('font-bold')}>
          ${this.bindings.i18n.t('answer-evaluation')}
        </legend>
        ${AtomicGeneratedAnswerFeedbackModal.options.map(
          ({localeKey, correspondingAnswer}) =>
            renderFieldsetGroup({
              props: {label: this.bindings.i18n.t(localeKey)},
            })(html`
              <div
                class=${tw(
                  'answer-evaluation mt-3 flex items-center',
                  String(correspondingAnswer)
                )}
                key=${String(correspondingAnswer)}
              >
                <div class=${tw('flex-1 pr-4')}>
                  ${this.renderAnswerEvaluation(localeKey, correspondingAnswer)}
                </div>
                <div
                  class=${tw('options flex flex-shrink-0 text-base')}
                  aria-label=${this.bindings.i18n.t(localeKey)}
                >
                  ${this.renderFeedbackOption('yes', correspondingAnswer)}
                  ${this.renderFeedbackOption('unknown', correspondingAnswer)}
                  ${this.renderFeedbackOption('no', correspondingAnswer)}
                </div>
              </div>
            `)
        )}
      </fieldset>
    `;
  }

  private renderLinkToCorrectAnswerField() {
    return html`
      <fieldset>
        <legend class=${tw('font-bold')}>
          ${this.bindings.i18n.t('generated-answer-feedback-link')}
        </legend>
        <input
          type="text"
          ${ref(this.linkInputRef)}
          placeholder="https://URL"
          class=${tw(
            'input-primary placeholder-neutral-dark mt-4 h-9 w-full rounded-md px-4'
          )}
          @change=${(e: Event) =>
            this.setCurrentAnswer(
              'documentUrl',
              (e.currentTarget as HTMLInputElement).value
            )}
        />
      </fieldset>
    `;
  }

  private renderAddNotesField() {
    return html`
      <fieldset>
        <legend class=${tw('mt-8 font-bold')}>
          ${this.bindings.i18n.t('generated-answer-additional-notes')}
        </legend>
        <textarea
          name="answer-details"
          ${ref(this.detailsInputRef)}
          class=${tw(
            'placeholder-neutral-dark border-neutral hover:border-primary-light focus-visible:border-primary mt-4 w-full resize-none rounded-md border px-4 py-2 leading-5 focus:outline-hidden focus-visible:ring-2'
          )}
          rows="4"
          placeholder=${this.bindings.i18n.t('add-notes')}
          @change=${(e: Event) =>
            this.setCurrentAnswer(
              'details',
              (e.currentTarget as HTMLTextAreaElement).value
            )}
        ></textarea>
      </fieldset>
    `;
  }

  private renderFeedbackForm() {
    return html`
      <form
        part="form"
        id=${this.formId}
        slot="body"
        @submit=${(e: Event) => this.handleSubmit(e)}
        class=${tw('flex flex-col gap-8 leading-4')}
      >
        ${this.renderOptions()} ${this.renderLinkToCorrectAnswerField()}
        ${this.renderAddNotesField()}
      </form>
    `;
  }

  private renderSuccessMessage() {
    return html`
      <div slot="body" class=${tw('my-4 flex flex-col items-center gap-4')}>
        <atomic-icon icon=${Success} class=${tw('w-48')}></atomic-icon>
        <p class=${tw('text-base')}>
          ${this.bindings.i18n.t('generated-answer-feedback-success')}
        </p>
      </div>
    `;
  }

  private renderBody() {
    if (!this.feedbackSubmitted) {
      return this.renderFeedbackForm();
    }
    return this.renderSuccessMessage();
  }

  private renderFeedbackFormFooter() {
    const buttonClasses =
      'flex items-center justify-center text-sm leading-4 p-2 rounded-md';

    return html`
      <div slot="footer" part="modal-footer">
        <div class=${tw('flex items-center justify-between')}>
          <div class=${tw('required-label text-base')}>
            <span class=${tw('text-error mr-0.5')}>*</span>
            ${this.bindings.i18n.t('required-fields')}
          </div>
          <div class=${tw('flex gap-2')}>
            ${renderButton({
              props: {
                part: 'cancel-button',
                style: 'outline-primary',
                class: buttonClasses,
                ariaLabel: this.bindings.i18n.t('skip'),
                onClick: () => this.close(),
              },
            })(html`${this.bindings.i18n.t('skip')}`)}
            ${renderButton({
              props: {
                part: 'submit-button',
                style: 'primary',
                type: 'submit',
                form: this.formId,
                class: buttonClasses,
                ariaLabel: this.bindings.i18n.t(
                  'generated-answer-send-feedback'
                ),
              },
            })(html`${this.bindings.i18n.t('generated-answer-send-feedback')}`)}
          </div>
        </div>
      </div>
    `;
  }

  private renderSuccessFormFooter() {
    return html`
      <div slot="footer">
        <div class=${tw('flex justify-end gap-2 p-2')}>
          ${renderButton({
            props: {
              part: 'cancel-button',
              style: 'primary',
              onClick: () => this.close(),
              class: 'flex justify-center p-2 text-sm leading-4',
              ariaLabel: this.bindings.i18n.t('modal-done'),
            },
          })(html`${this.bindings.i18n.t('modal-done')}`)}
        </div>
      </div>
    `;
  }

  private renderFooter() {
    if (!this.feedbackSubmitted) {
      return this.renderFeedbackFormFooter();
    }
    return this.renderSuccessFormFooter();
  }

  @errorGuard()
  render() {
    this.updateBreakpoints();

    return html`
      <atomic-modal
        .fullscreen=${false}
        .isOpen=${this.isOpen}
        .close=${() => this.close()}
        .container=${this as HTMLElement}
        part="generated-answer-feedback-modal"
        exportparts=${ATOMIC_MODAL_EXPORT_PARTS}
      >
        ${this.renderHeader()} ${this.renderBody()} ${this.renderFooter()}
      </atomic-modal>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-generated-answer-feedback-modal': AtomicGeneratedAnswerFeedbackModal;
  }
}
