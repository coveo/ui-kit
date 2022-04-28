import {Component, h, State, Prop, Watch, Element} from '@stencil/core';
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
import {once, randomID} from '../../utils/utils';
import {updateBreakpoints} from '../../utils/replace-breakpoint';

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
      this.smartSnippet.sendDetailedFeedback(this.detailsInputRef!.value);
    } else {
      this.smartSnippet.sendFeedback(this.currentAnswer!);
    }
    this.isOpen = false;
  }

  private close() {
    this.isOpen = false;
    this.smartSnippet.closeFeedbackModal();
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
      <fieldset>
        <legend part="reason-title" class="font-bold text-on-background">
          {this.bindings.i18n.t('smart-snippet-feedback-select-reason')}
        </legend>
        {options.map(({id, label, isChecked, onCheck}) => (
          <div key={id} class="text-base leading-4 text-neutral-dark mt-2">
            <input
              part="reason-radio"
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
            <label part="reason-label" htmlFor={id}>
              {label}
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
        <legend part="details-title" class="font-bold text-on-background">
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

  private updateBreakpoints = once(() => updateBreakpoints(this.host));

  public render() {
    this.updateBreakpoints();

    return (
      <atomic-modal
        source={this.source}
        isOpen={this.isOpen}
        close={() => this.close()}
        exportparts="backdrop,container,header,header-wrapper,header-ruler,body,body-wrapper,footer,footer-wrapper,footer-wrapper"
      >
        {this.renderHeader()}
        {this.renderBody()}
        {this.renderFooter()}
      </atomic-modal>
    );
  }
}
