import type {
  GeneratedAnswer,
  GeneratedAnswerState,
  SearchStatusState,
} from '@coveo/headless';
import type {ReactiveController, ReactiveControllerHost} from 'lit';
import type {AnyBindings} from '@/src/components/common/interface/bindings';
import {
  type GeneratedAnswerData,
  SafeStorage,
  StorageItems,
} from '@/src/utils/local-storage-utils';

export interface GeneratedAnswerControllerOptions {
  withToggle?: boolean;
  getGeneratedAnswer: () => GeneratedAnswer | undefined;
  getGeneratedAnswerState: () => GeneratedAnswerState | undefined;
  getSearchStatusState: () => SearchStatusState | undefined;
  getBindings: () => AnyBindings;
}

/**
 * Reactive controller managing shared logic for generated answer components.
 * Handles storage, modal interactions, feedback, and clipboard operations.
 */
export class GeneratedAnswerController implements ReactiveController {
  private host: ReactiveControllerHost & HTMLElement;
  private storage: SafeStorage = new SafeStorage();
  private _data: GeneratedAnswerData;
  private modalRef?: HTMLAtomicGeneratedAnswerFeedbackModalElement;
  private options: GeneratedAnswerControllerOptions;

  constructor(
    host: ReactiveControllerHost & HTMLElement,
    options: GeneratedAnswerControllerOptions
  ) {
    this.host = host;
    this.options = options;
    this._data = this.readStoredData();
    host.addController(this);
  }

  hostConnected(): void {
    // Controller is ready when host connects
  }

  get data(): GeneratedAnswerData {
    return this._data;
  }

  set data(newData: GeneratedAnswerData) {
    this._data = newData;
  }

  /**
   * Creates and inserts the feedback modal element before the host element.
   */
  public insertFeedbackModal(): void {
    this.modalRef = document.createElement(
      'atomic-generated-answer-feedback-modal'
    );
    const generatedAnswer = this.options.getGeneratedAnswer();
    if (generatedAnswer) {
      this.modalRef.generatedAnswer = generatedAnswer;
    }
    this.host.insertAdjacentElement('beforebegin', this.modalRef);
  }

  /**
   * Reads stored visibility data from local storage.
   */
  public readStoredData(): GeneratedAnswerData {
    const {withToggle} = this.options;
    const storedData = this.storage.getParsedJSON<GeneratedAnswerData>(
      StorageItems.GENERATED_ANSWER_DATA,
      {isVisible: true}
    );

    // Ensures answer is visible when toggle is hidden and visibility is false in storage
    return {isVisible: (withToggle && storedData.isVisible) || !withToggle};
  }

  /**
   * Writes visibility data to local storage.
   */
  public writeStoredData(data: GeneratedAnswerData): void {
    this.storage.setJSON(StorageItems.GENERATED_ANSWER_DATA, data);
  }

  /**
   * Generates a status message describing the current state of the generated answer.
   */
  public getGeneratedAnswerStatus(): string {
    const state = this.options.getGeneratedAnswerState();
    const bindings = this.options.getBindings();

    if (!state) {
      return '';
    }

    const isHidden = !state.isVisible;
    const isGenerating = !!state.isStreaming;
    const hasAnswer = !!state.answer;
    const hasError = !!state.error;

    if (isHidden) {
      return bindings.i18n.t('generated-answer-hidden');
    }

    if (isGenerating) {
      return bindings.i18n.t('generating-answer');
    }

    if (hasError) {
      return bindings.i18n.t('answer-could-not-be-generated');
    }

    if (hasAnswer) {
      return bindings.i18n.t('answer-generated', {
        answer: state.answer,
      });
    }

    return '';
  }

  /**
   * Checks if there's a retryable error.
   */
  public get hasRetryableError(): boolean {
    const searchState = this.options.getSearchStatusState();
    const answerState = this.options.getGeneratedAnswerState();
    return !searchState?.hasError && !!answerState?.error?.isRetryable;
  }

  /**
   * Checks if no answer has been generated.
   */
  public get hasNoAnswerGenerated(): boolean {
    const {answer, citations} = this.options.getGeneratedAnswerState() ?? {};
    return (
      answer === undefined && !citations?.length && !this.hasRetryableError
    );
  }

  /**
   * Checks if the answer is currently visible.
   */
  public get isAnswerVisible(): boolean {
    return !!this.options.getGeneratedAnswerState()?.isVisible;
  }

  /**
   * Gets the tooltip text for the toggle button.
   */
  public getToggleTooltip(): string {
    const key = this.isAnswerVisible
      ? 'generated-answer-toggle-on'
      : 'generated-answer-toggle-off';
    return this.options.getBindings().i18n.t(key);
  }

  /**
   * Gets the tooltip text for the copy to clipboard button.
   */
  public getCopyToClipboardTooltip(
    copied: boolean,
    copyError: boolean
  ): string {
    const bindings = this.options.getBindings();

    if (copyError) {
      return bindings.i18n.t('failed-to-copy-generated-answer');
    }

    return !copied
      ? bindings.i18n.t('copy-generated-answer')
      : bindings.i18n.t('generated-answer-copied');
  }

  /**
   * Copies the answer text to clipboard and logs the action.
   */
  public async copyToClipboard(
    answer: string,
    onCopySuccess: () => void,
    onCopyError: () => void
  ): Promise<void> {
    try {
      await navigator.clipboard.writeText(answer);
      onCopySuccess();
      this.options.getGeneratedAnswer()?.logCopyToClipboard();
    } catch (error) {
      onCopyError();
      this.options
        .getBindings()
        .engine.logger.error(`Failed to copy to clipboard: ${error}`);
    }
  }

  /**
   * Handles clicking the show/collapse button.
   */
  public clickOnShowButton(): void {
    const state = this.options.getGeneratedAnswerState();
    const generatedAnswer = this.options.getGeneratedAnswer();

    if (state?.expanded) {
      generatedAnswer?.collapse();
    } else {
      generatedAnswer?.expand();
    }
  }

  /**
   * Sets whether the answer was helpful (for the feedback modal).
   */
  private setIsAnswerHelpful(isHelpful: boolean): void {
    if (this.modalRef) {
      this.modalRef.helpful = isHelpful;
    }
  }

  /**
   * Opens the feedback modal if conditions are met.
   */
  private openFeedbackModal(): void {
    const state = this.options.getGeneratedAnswerState();
    if (this.modalRef && !state?.feedbackSubmitted) {
      this.modalRef.isOpen = true;
    }
  }

  /**
   * Handles the dislike action.
   */
  public clickDislike(): void {
    this.setIsAnswerHelpful(false);
    this.options.getGeneratedAnswer()?.dislike();
    this.openFeedbackModal();
  }

  /**
   * Handles the like action.
   */
  public clickLike(): void {
    this.setIsAnswerHelpful(true);
    this.options.getGeneratedAnswer()?.like();
    this.openFeedbackModal();
  }
}
