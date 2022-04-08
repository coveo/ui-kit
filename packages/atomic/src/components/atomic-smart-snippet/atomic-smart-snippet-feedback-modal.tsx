import {Component, h, State, Prop, Watch} from '@stencil/core';
import {
  Bindings,
  InitializableComponent,
  InitializeBindings,
} from '../../utils/initialization-utils';
import {
  buildSmartSnippet,
  SmartSnippet,
  SmartSnippetFeedback,
} from '@coveo/headless';
import {Button} from '../common/button';
import {randomID} from '../../utils/utils';

/**
 * @part container - The modal's outermost container with the outline and background.
 * @part header - The header at the top of the modal.
 * @part header-wrapper - The wrapper around the header.
 * @part header-ruler - The horizontal ruler underneath the header.
 * @part body - The body of the modal, between the header and the footer.
 * @part body-wrapper - The wrapper around the body.
 * @part footer - The footer at the bottom of the modal.
 * @part footer-wrapper - The wrapper with a shadow around the footer.
 * @internal
 */
@Component({
  tag: 'atomic-smart-snippet-feedback-modal',
  styleUrl: 'atomic-smart-snippet-feedback-modal.pcss',
  shadow: true,
})
export class AtomicRefineModal implements InitializableComponent {
  @InitializeBindings() public bindings!: Bindings;
  public smartSnippet!: SmartSnippet;

  @State() public error!: Error;

  @Prop({mutable: true}) source?: HTMLElement;
  @Prop({reflect: true, mutable: true}) isOpen = false;

  @State() currentAnswer?: SmartSnippetFeedback | 'other' | undefined;
  private detailsInputRef?: HTMLTextAreaElement;
  private readonly formId = randomID(
    'atomic-smart-snippet-feedback-modal-form-'
  );

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

  private sendFeedback() {
    if (this.currentAnswer === 'other') {
      this.smartSnippet.sendDetailedFeedback(this.detailsInputRef!.value); // TODO: Add textarea
    } else {
      this.smartSnippet.sendFeedback(this.currentAnswer!);
    }
    this.isOpen = false;
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
      label: string;
      isChecked: boolean;
      onCheck: () => void;
    }[] = [
      {
        id: 'does-not-answer',
        label: this.bindings.i18n.t(
          'smart-snippet-feedback-reason-does-not-answer'
        ),
        isChecked: this.currentAnswer === 'does_not_answer',
        onCheck: () => (this.currentAnswer = 'does_not_answer'),
      },
      {
        id: 'partially-answers',
        label: this.bindings.i18n.t(
          'smart-snippet-feedback-reason-partially-answers'
        ),
        isChecked: this.currentAnswer === 'partially_answers',
        onCheck: () => (this.currentAnswer = 'partially_answers'),
      },
      {
        id: 'was-not-a-question',
        label: this.bindings.i18n.t(
          'smart-snippet-feedback-reason-was-not-a-question'
        ),
        isChecked: this.currentAnswer === 'was_not_a_question',
        onCheck: () => (this.currentAnswer = 'was_not_a_question'),
      },
      {
        id: 'other',
        label: this.bindings.i18n.t('smart-snippet-feedback-reason-other'),
        isChecked: this.currentAnswer === 'other',
        onCheck: () => (this.currentAnswer = 'other'),
      },
    ];

    return (
      <fieldset class="mt-8">
        <legend class="text-2xl font-bold text-on-background">
          {this.bindings.i18n.t('smart-snippet-feedback-select-reason')}
        </legend>
        {options.map(({id, label, isChecked, onCheck}) => (
          <div key={id} class="text-base leading-4 text-neutral-dark mt-2">
            <input
              type="radio"
              name="answer"
              id={id}
              checked={isChecked}
              onChange={(e) =>
                (e.currentTarget as HTMLInputElement | null)?.checked &&
                onCheck()
              }
              class="mr-2 w-4 h-4"
              required
            />
            <label htmlFor={id}>{label}</label>
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
      <fieldset class="mt-8">
        <legend class="text-2xl font-bold text-on-background">
          {this.bindings.i18n.t('smart-snippet-feedback-details')}
        </legend>
        <textarea
          name="answer-details"
          ref={(detailsInput) => (this.detailsInputRef = detailsInput)}
          class="mt-2 w-full text-base leading-4 border border-neutral-dark resize-none rounded"
          rows={4}
          required
        ></textarea>
      </fieldset>
    );
  }

  private renderBody() {
    return (
      <form
        id={this.formId}
        slot="body"
        onSubmit={(e) => {
          e.preventDefault();
          this.sendFeedback();
        }}
      >
        {this.renderOptions()}
        {this.renderDetails()}
      </form>
    );
  }

  private renderFooter() {
    return (
      <div slot="footer" class="flex justify-end gap-2">
        <Button
          style="outline-neutral"
          class="p-3 flex text-lg justify-center"
          onClick={() => {
            this.isOpen = false;
            this.smartSnippet.closeFeedbackModal();
          }}
        >
          {this.bindings.i18n.t('cancel')}
        </Button>
        <Button
          style="primary"
          class="p-3 flex text-lg justify-center"
          type="submit"
          form={this.formId}
        >
          {this.bindings.i18n.t('smart-snippet-feedback-send')}
        </Button>
      </div>
    );
  }

  public render() {
    return (
      <atomic-modal source={this.source} is-open={this.isOpen}>
        {this.renderHeader()}
        {this.renderBody()}
        {this.renderFooter()}
      </atomic-modal>
    );
  }
}
