import {SmartSnippet, SmartSnippetFeedback} from '@coveo/headless';
import {EventEmitter, h} from '@stencil/core';
import {updateBreakpoints} from '../../../../utils/replace-breakpoint';
import {once} from '../../../../utils/utils';
import {AnyBindings} from '../../interface/bindings';
import {Button} from '../../stencil-button';

interface SmartSnippetFeedbackModalProps {
  formId: string;
  getHost: () => HTMLElement;
  getBindings: () => AnyBindings;
  getCurrentAnswer: () => SmartSnippetFeedback | 'other' | undefined;
  getSmartSnippet: () => SmartSnippet;
  getDetailsInputRef: () => HTMLTextAreaElement | undefined;
  getFeedbackSent: () => EventEmitter;
  getSource: () => HTMLElement | undefined;
  getIsOpen: () => boolean;
  setIsOpen: (isOpen: boolean) => void;
  setCurrentAnswer: (answer: SmartSnippetFeedback | 'other') => void;
  setDetailsInputRef: (ref?: HTMLTextAreaElement) => void;
}

export class SmartSnippetFeedbackModalCommon {
  constructor(private props: SmartSnippetFeedbackModalProps) {}

  public sendFeedback() {
    if (this.props.getCurrentAnswer() === 'other') {
      this.props
        .getSmartSnippet()
        .sendDetailedFeedback(this.props.getDetailsInputRef()!.value);
    } else {
      this.props
        .getSmartSnippet()
        .sendFeedback(this.props.getCurrentAnswer() as SmartSnippetFeedback);
    }
    this.props.getFeedbackSent().emit();
    this.props.setIsOpen(false);
  }

  public close() {
    this.props.setIsOpen(false);
    this.props.getSmartSnippet().closeFeedbackModal();
  }

  private renderHeader() {
    return (
      <h1 slot="header">
        {this.props.getBindings().i18n.t('smart-snippet-feedback-explain-why')}
      </h1>
    );
  }

  private renderOptions() {
    const options: {
      id: string;
      localeKey: string;
      correspondingAnswer: SmartSnippetFeedback | 'other';
    }[] = [
      {
        id: 'does-not-answer',
        localeKey: 'smart-snippet-feedback-reason-does-not-answer',
        correspondingAnswer: 'does_not_answer',
      },
      {
        id: 'partially-answers',
        localeKey: 'smart-snippet-feedback-reason-partially-answers',
        correspondingAnswer: 'partially_answers',
      },
      {
        id: 'was-not-a-question',
        localeKey: 'smart-snippet-feedback-reason-was-not-a-question',
        correspondingAnswer: 'was_not_a_question',
      },
      {
        id: 'other',
        localeKey: 'smart-snippet-feedback-reason-other',
        correspondingAnswer: 'other',
      },
    ];

    return (
      <fieldset>
        <legend
          part="reason-title"
          class="text-on-background text-lg font-bold"
        >
          {this.props
            .getBindings()
            .i18n.t('smart-snippet-feedback-select-reason')}
        </legend>
        {options.map(({id, localeKey, correspondingAnswer}) => (
          <div class="flex items-center" key={id} part="reason">
            <input
              part="reason-radio"
              type="radio"
              name="answer"
              id={id}
              checked={this.props.getCurrentAnswer() === correspondingAnswer}
              onChange={(e) =>
                (e.currentTarget as HTMLInputElement | null)?.checked &&
                this.props.setCurrentAnswer(correspondingAnswer)
              }
              class="mr-2 h-4 w-4"
              required
            />
            <label part="reason-label" htmlFor={id}>
              {this.props.getBindings().i18n.t(localeKey)}
            </label>
          </div>
        ))}
      </fieldset>
    );
  }

  private renderDetails() {
    if (this.props.getCurrentAnswer() !== 'other') {
      return;
    }

    return (
      <fieldset>
        <legend
          part="details-title"
          class="text-on-background text-lg font-bold"
        >
          {this.props.getBindings().i18n.t('details')}
        </legend>
        <textarea
          part="details-input"
          name="answer-details"
          ref={(detailsInput) => this.props.setDetailsInputRef(detailsInput)}
          class="border-neutral mt-2 w-full resize-none rounded border p-2 text-base leading-5"
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
        id={this.props.formId}
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
          {this.props.getBindings().i18n.t('cancel')}
        </Button>
        <Button
          part="submit-button"
          style="primary"
          type="submit"
          form={this.props.formId}
        >
          {this.props.getBindings().i18n.t('feedback-send')}
        </Button>
      </div>
    );
  }

  private updateBreakpoints = once(() =>
    updateBreakpoints(this.props.getHost())
  );

  public render() {
    this.updateBreakpoints();

    return (
      <atomic-modal
        fullscreen={false}
        source={this.props.getSource()}
        container={this.props.getHost()}
        isOpen={this.props.getIsOpen()}
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
