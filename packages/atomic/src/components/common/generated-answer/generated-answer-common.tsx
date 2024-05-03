import {
  GeneratedAnswer,
  GeneratedAnswerCitation,
  GeneratedAnswerState,
  GeneratedAnswerStyle,
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
import {Heading} from '../heading';
import {AnyBindings} from '../interface/bindings';
import {Switch} from '../switch';
import {CopyButton} from './copy-button';
import {FeedbackButton} from './feedback-button';
import {GeneratedContentContainer} from './generated-content-container';
import {RephraseButtons} from './rephrase-buttons';
import {RetryPrompt} from './retry-prompt';
import {ShowButton} from './show-button';
import {SourceCitations} from './source-citations';

interface GeneratedAnswerCommonOptions {
  host: HTMLElement;
  collapsible?: boolean;
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

  private contentClasses =
    'mt-0 mb-4 border border-neutral shadow-lg p-6 bg-background rounded-lg p-6 text-on-background';

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
    return this.storage.getParsedJSON<GeneratedAnswerData>(
      StorageItems.GENERATED_ANSWER_DATA,
      {isVisible: true}
    );
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

  private get shouldBeHidden() {
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
              exportparts="citation,citation-popover"
            />
          </li>
        );
      }
    );
  }

  private renderFeedbackAndCopyButtons() {
    const {
      getGeneratedAnswerState,
      getBindings,
      getGeneratedAnswer,
      getCopied,
      getCopyError,
    } = this.props;
    const {i18n} = getBindings();
    const {liked, disliked, answer, isStreaming} =
      getGeneratedAnswerState() ?? {};

    if (isStreaming) {
      return null;
    }
    return (
      <div class="feedback-buttons flex h-9 absolute top-6 right-20 shrink-0 gap-2">
        <FeedbackButton
          title={i18n.t('this-answer-was-helpful')}
          variant="like"
          active={!!liked}
          onClick={() => getGeneratedAnswer()?.like()}
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

  private clickDislike() {
    if (
      this.modalRef &&
      !this.props.getGeneratedAnswerState()?.feedbackSubmitted
    ) {
      this.modalRef.isOpen = true;
    }
    this.props.getGeneratedAnswer()?.dislike();
  }

  private onChangeAnswerStyle(answerStyle: GeneratedAnswerStyle) {
    if (
      this.props.getGeneratedAnswerState()?.responseFormat.answerStyle !==
      answerStyle
    ) {
      this.props.getGeneratedAnswer()?.rephrase({
        ...this.props.getGeneratedAnswerState()?.responseFormat,
        answerStyle,
      });
    }
  }

  private renderRephraseButtons() {
    const {getGeneratedAnswerState, getBindings} = this.props;
    const {i18n} = getBindings();
    const {isStreaming, responseFormat} = getGeneratedAnswerState() ?? {};
    const {answerStyle} = responseFormat ?? {};

    if (isStreaming) {
      return null;
    }
    return (
      <RephraseButtons
        answerStyle={answerStyle ?? 'default'}
        i18n={i18n}
        onChange={(answerStyle) => this.onChangeAnswerStyle(answerStyle)}
      />
    );
  }

  private renderDisclaimer() {
    const {getGeneratedAnswerState, getBindings} = this.props;
    const {i18n} = getBindings();
    const {isStreaming} = getGeneratedAnswerState() ?? {};

    if (isStreaming) {
      return null;
    }
    return (
      <div class="text-neutral-dark text-xs">
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
        class="hidden text-primary font-light text-base"
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
            class="text-bg-primary font-medium inline-block rounded-md py-2 px-2.5"
          >
            {i18n.t('generated-answer-title')}
          </Heading>
          <div class="flex h-9 items-center ml-auto">
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

            {this.renderRephraseButtons()}
          </GeneratedContentContainer>
        ) : null}

        {!this.hasRetryableError && this.isAnswerVisible && (
          <div part="generated-answer-footer" class="flex justify-end mt-6">
            {this.renderGeneratingAnswerLabel()}
            {this.renderShowButton()}
            {this.renderDisclaimer()}
          </div>
        )}
      </div>
    );
  }

  public render() {
    if (this.shouldBeHidden) {
      return null;
    }
    return (
      <div>
        <aside class={`mx-auto ${this.contentClasses}`} part="container">
          <article>{this.renderContent()}</article>
        </aside>
      </div>
    );
  }
}
