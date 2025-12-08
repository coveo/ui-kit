import {
  GeneratedAnswer,
  GeneratedAnswerCitation,
  GeneratedAnswerState,
  InteractiveCitation,
  InteractiveCitationProps,
  SearchStatusState,
} from '@coveo/headless';
import {h} from '@stencil/core';
import {
  GeneratedAnswerData,
  SafeStorage,
  StorageItems,
} from '../../../utils/local-storage-utils';
import {getNamedSlotContent} from '../../../utils/slot-utils';
import {AnyBindings} from '../interface/bindings';
import {Heading} from '../stencil-heading';
import {CopyButton} from './stencil-copy-button';
import {Switch} from '../stencil-switch';
import {FeedbackButton} from './stencil-feedback-button';
import {GeneratedContentContainer} from './stencil-generated-content-container';
import {ShowButton} from './stencil-show-button';
import {RetryPrompt} from './stencil-retry-prompt';
import {SourceCitations} from './source-citations';

interface GeneratedAnswerCommonOptions {
  host: HTMLElement;
  withToggle?: boolean;
  collapsible?: boolean;
  disableCitationAnchoring?: boolean;
  getGeneratedAnswer: () => GeneratedAnswer | undefined;
  getGeneratedAnswerState: () => GeneratedAnswerState | undefined;
  getSearchStatusState: () => SearchStatusState | undefined;
  getBindings: () => AnyBindings;
  getCopied: () => boolean;
  setCopied: (isCopied: boolean) => void;
  getCopyError: () => boolean;
  setCopyError: (copyError: boolean) => void;
  setAriaMessage: (message: string) => void;
  buildInteractiveCitation: (
    props: InteractiveCitationProps
  ) => InteractiveCitation;
}

export class GeneratedAnswerCommon {
  private storage: SafeStorage = new SafeStorage();
  private _data: GeneratedAnswerData;
  private modalRef?: HTMLAtomicGeneratedAnswerFeedbackModalElement;

  constructor(private props: GeneratedAnswerCommonOptions) {
    this._data = this.readStoredData();
  }

  public insertFeedbackModal() {
    this.modalRef = document.createElement(
      'atomic-generated-answer-feedback-modal'
    );
    this.modalRef.generatedAnswer = this.props.getGeneratedAnswer()!;
    this.props.host.insertAdjacentElement('beforebegin', this.modalRef);
  }

  public readStoredData(): GeneratedAnswerData {
    const {withToggle} = this.props;
    const storedData = this.storage.getParsedJSON<GeneratedAnswerData>(
      StorageItems.GENERATED_ANSWER_DATA,
      {isVisible: true}
    );

    // This check ensures that the answer is visible when the toggle is hidden and visible is set to false in the local storage.
    return {isVisible: (withToggle && storedData.isVisible) || !withToggle};
  }

  public writeStoredData(data: GeneratedAnswerData) {
    this.storage.setJSON(StorageItems.GENERATED_ANSWER_DATA, data);
  }

  get data() {
    return this._data;
  }

  set data(newData: GeneratedAnswerData) {
    this._data = newData;
  }

  public getGeneratedAnswerStatus() {
    const isHidden = !this.props.getGeneratedAnswerState()?.isVisible;
    const isGenerating = !!this.props.getGeneratedAnswerState()?.isStreaming;
    const hasAnswer = !!this.props.getGeneratedAnswerState()?.answer;
    const hasError = !!this.props.getGeneratedAnswerState()?.error;

    if (isHidden) {
      return this.props.getBindings().i18n.t('generated-answer-hidden');
    }

    if (isGenerating) {
      return this.props.getBindings().i18n.t('generating-answer');
    }

    if (hasError) {
      return this.props.getBindings().i18n.t('answer-could-not-be-generated');
    }

    if (hasAnswer) {
      return this.props.getBindings().i18n.t('answer-generated', {
        answer: this.props.getGeneratedAnswerState()?.answer,
      });
    }

    return '';
  }

  private get hasRetryableError() {
    return (
      !this.props.getSearchStatusState()?.hasError &&
      this.props.getGeneratedAnswerState()?.error?.isRetryable
    );
  }

  private get hasNoAnswerGenerated() {
    const {answer, citations} = this.props.getGeneratedAnswerState() ?? {};
    return (
      answer === undefined && !citations?.length && !this.hasRetryableError
    );
  }

  private get isAnswerVisible() {
    return this.props.getGeneratedAnswerState()?.isVisible;
  }

  private get toggleTooltip() {
    const key = this.isAnswerVisible
      ? 'generated-answer-toggle-on'
      : 'generated-answer-toggle-off';
    return this.props.getBindings().i18n.t(key);
  }

  private get hasClipboard() {
    return !!navigator?.clipboard?.writeText;
  }

  private get copyToClipboardTooltip() {
    if (this.props.getCopyError()) {
      return this.props.getBindings().i18n.t('failed-to-copy-generated-answer');
    }

    return !this.props.getCopied()
      ? this.props.getBindings().i18n.t('copy-generated-answer')
      : this.props.getBindings().i18n.t('generated-answer-copied');
  }

  private get hasCustomNoAnswerMessage() {
    return getNamedSlotContent(this.props.host, 'no-answer-message').length > 0;
  }

  private async copyToClipboard(answer: string) {
    try {
      await navigator.clipboard.writeText(answer);
      this.props.setCopied(true);
      this.props.getGeneratedAnswer()?.logCopyToClipboard();
    } catch (error) {
      this.props.setCopyError(true);
      this.props
        .getBindings()
        .engine.logger.error(`Failed to copy to clipboard: ${error}`);
    }

    setTimeout(() => {
      this.props.setCopied(false);
      this.props.setCopyError(false);
    }, 2000);
  }

  private clickOnShowButton() {
    if (this.props.getGeneratedAnswerState()?.expanded) {
      this.props.getGeneratedAnswer()?.collapse();
    } else {
      this.props.getGeneratedAnswer()?.expand();
    }
  }

  private getCitation(citation: GeneratedAnswerCitation) {
    const {title} = citation;
    const {i18n} = this.props.getBindings();

    return title.trim() !== ''
      ? citation
      : {...citation, title: i18n.t('no-title')};
  }

  private renderCitations() {
    const {
      getGeneratedAnswerState,
      buildInteractiveCitation,
      getGeneratedAnswer,
      disableCitationAnchoring,
    } = this.props;
    const {citations} = getGeneratedAnswerState() ?? {};
    const {logCitationHover} = getGeneratedAnswer() ?? {};

    return citations?.map(
      (citation: GeneratedAnswerCitation, index: number) => {
        const interactiveCitation = buildInteractiveCitation({
          options: {
            citation,
          },
        });
        return (
          <li key={citation.id} class="max-w-full">
            <atomic-citation
              citation={this.getCitation(citation)}
              index={index}
              sendHoverEndEvent={(citationHoverTimeMs: number) => {
                logCitationHover?.(citation.id, citationHoverTimeMs);
              }}
              interactiveCitation={interactiveCitation}
              disableCitationAnchoring={disableCitationAnchoring}
              exportparts="citation,citation-popover"
            />
          </li>
        );
      }
    );
  }

  private renderFeedbackAndCopyButtons() {
    const {getGeneratedAnswerState, getBindings, getCopied, getCopyError} =
      this.props;
    const {i18n} = getBindings();
    const {liked, disliked, answer, isStreaming} =
      getGeneratedAnswerState() ?? {};

    const containerClasses = [
      'feedback-buttons',
      'flex',
      'h-9',
      'absolute',
      'top-6',
      'shrink-0',
      'gap-2',
      this.props.withToggle ? 'right-20' : 'right-6',
    ].join(' ');

    if (isStreaming) {
      return null;
    }

    return (
      <div class={containerClasses}>
        <FeedbackButton
          title={i18n.t('this-answer-was-helpful')}
          variant="like"
          active={!!liked}
          onClick={() => this.clickLike()}
        />
        <FeedbackButton
          title={i18n.t('this-answer-was-not-helpful')}
          variant="dislike"
          active={!!disliked}
          onClick={() => this.clickDislike()}
        />
        {this.hasClipboard ? (
          <CopyButton
            title={this.copyToClipboardTooltip}
            isCopied={getCopied()}
            error={getCopyError()}
            onClick={async () => {
              if (answer) {
                await this.copyToClipboard(answer);
              }
            }}
          />
        ) : null}
      </div>
    );
  }

  private setIsAnswerHelpful(isAnswerHelpful: boolean) {
    if (this.modalRef) {
      this.modalRef.helpful = isAnswerHelpful;
    }
  }

  private openFeedbackModal() {
    if (
      this.modalRef &&
      !this.props.getGeneratedAnswerState()?.feedbackSubmitted
    ) {
      this.modalRef.isOpen = true;
    }
  }

  private clickDislike() {
    this.setIsAnswerHelpful(false);
    this.props.getGeneratedAnswer()?.dislike();
    this.openFeedbackModal();
  }

  private clickLike() {
    this.setIsAnswerHelpful(true);
    this.props.getGeneratedAnswer()?.like();
    this.openFeedbackModal();
  }

  private renderDisclaimer() {
    const {getGeneratedAnswerState, getBindings} = this.props;
    const {i18n} = getBindings();
    const {isStreaming} = getGeneratedAnswerState() ?? {};

    if (isStreaming) {
      return null;
    }
    return (
      <div class="text-neutral-dark text-xs/[1rem]">
        <slot name="disclaimer" slot="disclaimer">
          {i18n.t('generated-answer-disclaimer')}
        </slot>
      </div>
    );
  }

  private renderShowButton() {
    const {getGeneratedAnswerState, getBindings, collapsible} = this.props;
    const {i18n} = getBindings();
    const {expanded, isStreaming} = getGeneratedAnswerState() ?? {};
    const canRender = collapsible && !isStreaming;

    if (!canRender) {
      return null;
    }
    return (
      <ShowButton
        i18n={i18n}
        onClick={() => this.clickOnShowButton()}
        isCollapsed={!expanded}
      ></ShowButton>
    );
  }

  private renderGeneratingAnswerLabel() {
    const {getGeneratedAnswerState, getBindings, collapsible} = this.props;
    const {i18n} = getBindings();
    const {isStreaming} = getGeneratedAnswerState() ?? {};

    const canRender = collapsible && isStreaming;

    if (!canRender) {
      return null;
    }
    return (
      <div
        part="is-generating"
        class="text-primary hidden text-base font-light"
      >
        {i18n.t('generating-answer')}...
      </div>
    );
  }

  private renderContent() {
    const {getGeneratedAnswerState, getBindings, getGeneratedAnswer} =
      this.props;
    const {i18n} = getBindings();
    const {isStreaming, answer, citations, answerContentFormat} =
      getGeneratedAnswerState() ?? {};

    return (
      <div part="generated-content">
        <div class="flex items-center">
          <Heading
            level={0}
            part="header-label"
            class="text-primary bg-primary-background inline-block rounded-md px-2.5 py-2 font-medium"
          >
            {i18n.t('generated-answer-title')}
          </Heading>
          <div class="ml-auto flex h-9 items-center">
            <Switch
              part="toggle"
              checked={this.isAnswerVisible}
              onToggle={(checked) => {
                checked
                  ? getGeneratedAnswer()?.show()
                  : getGeneratedAnswer()?.hide();
              }}
              ariaLabel={i18n.t('generated-answer-title')}
              title={this.toggleTooltip}
              withToggle={this.props.withToggle}
            ></Switch>
          </div>
        </div>
        {this.hasRetryableError && this.isAnswerVisible ? (
          <RetryPrompt
            onClick={() => getGeneratedAnswer()?.retry()}
            buttonLabel={i18n.t('retry')}
            message={i18n.t('retry-stream-message')}
          />
        ) : null}

        {!this.hasRetryableError && this.isAnswerVisible ? (
          <GeneratedContentContainer
            answer={answer}
            answerContentFormat={answerContentFormat}
            isStreaming={!!isStreaming}
          >
            {this.renderFeedbackAndCopyButtons()}
            <SourceCitations
              label={i18n.t('citations')}
              isVisible={!!citations?.length}
            >
              {this.renderCitations()}
            </SourceCitations>
          </GeneratedContentContainer>
        ) : null}

        {!this.hasRetryableError && this.isAnswerVisible && (
          <div part="generated-answer-footer" class="mt-6 flex justify-end">
            {this.renderGeneratingAnswerLabel()}
            {this.renderShowButton()}
            {this.renderDisclaimer()}
          </div>
        )}
      </div>
    );
  }

  private renderCustomNoAnswerMessage() {
    const {getBindings} = this.props;
    const {i18n} = getBindings();

    return (
      <div part="generated-content">
        <div class="flex items-center">
          <Heading
            level={0}
            part="header-label"
            class="text-primary bg-primary-background inline-block rounded-md px-2.5 py-2 font-medium"
          >
            {i18n.t('generated-answer-title')}
          </Heading>
        </div>
        <div part="generated-container" class="mt-6 break-words">
          <slot name="no-answer-message"></slot>
        </div>
      </div>
    );
  }

  public render() {
    const {getGeneratedAnswerState} = this.props;
    const {cannotAnswer} = getGeneratedAnswerState() ?? {};
    const contentClasses =
      'mx-auto mt-0 mb-4 border border-neutral shadow-lg p-6 bg-background rounded-lg p-6 text-on-background';

    if (this.hasNoAnswerGenerated) {
      return cannotAnswer && this.hasCustomNoAnswerMessage ? (
        <div>
          <aside class={contentClasses} part="container" aria-label={this.props.getBindings().i18n.t('generated-answer-title')}>
            <article>{this.renderCustomNoAnswerMessage()}</article>
          </aside>
        </div>
      ) : null;
    }

    return (
      <div>
        <aside class={contentClasses} part="container" aria-label={this.props.getBindings().i18n.t('generated-answer-title')}>
          <article>{this.renderContent()}</article>
        </aside>
      </div>
    );
  }
}
