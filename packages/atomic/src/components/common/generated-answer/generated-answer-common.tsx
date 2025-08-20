import type {
  GeneratedAnswer,
  GeneratedAnswerCitation,
  GeneratedAnswerState,
  InteractiveCitation,
} from '@coveo/headless';
import { FunctionalComponent, h } from '@stencil/core';
import type { i18n } from 'i18next';
import {
  GeneratedAnswerData,
  SafeStorage,
  StorageItems,
} from '../../../utils/local-storage-utils';
import { Heading } from '../stencil-heading';
import { Switch } from '../switch';
import { CopyButton } from './copy-button';
import { FeedbackButton } from './feedback-button';
import { GeneratedContentContainer } from './generated-content-container';
import { RetryPrompt } from './retry-prompt';
import { ShowButton } from './show-button';
import { SourceCitations } from './source-citations';

export const readGeneratedAnswerStoredData = (withToggle?: boolean): GeneratedAnswerData => {
  const storage = new SafeStorage();
  const storedData = storage.getParsedJSON<GeneratedAnswerData>(
    StorageItems.GENERATED_ANSWER_DATA,
    { isVisible: true }
  );

  // This check ensures that the answer is visible when the toggle is hidden and visible is set to false in the local storage.
  return { isVisible: (withToggle && storedData.isVisible) || !withToggle };
};

export const writeGeneratedAnswerStoredData = (data: GeneratedAnswerData) => {
  const storage = new SafeStorage();
  storage.setJSON(StorageItems.GENERATED_ANSWER_DATA, data);
};

export const insertGeneratedAnswerFeedbackModal = (
  host: HTMLElement,
  generatedAnswer?: () => any
) => {
  const modalRef = document.createElement(
    'atomic-generated-answer-feedback-modal'
  );
  if (generatedAnswer) {
    modalRef.generatedAnswer = generatedAnswer();
  }
  host.insertAdjacentElement('beforebegin', modalRef);
  return modalRef;
};

export const getGeneratedAnswerStatus = (
  generatedAnswerState?: GeneratedAnswerState,
  i18n?: i18n
) => {
  if (!generatedAnswerState || !i18n) {
    return '';
  }

  const isHidden = !generatedAnswerState.isVisible;
  const isGenerating = !!generatedAnswerState.isStreaming;
  const hasAnswer = !!generatedAnswerState.answer;
  const hasError = !!generatedAnswerState.error;

  if (isHidden) {
    return i18n.t('generated-answer-hidden');
  }

  if (isGenerating) {
    return i18n.t('generating-answer');
  }

  if (hasError) {
    return i18n.t('answer-could-not-be-generated');
  }

  if (hasAnswer) {
    return i18n.t('answer-generated', {
      answer: generatedAnswerState.answer,
    });
  }

  return '';
};

export const copyToClipboard = async (
  answer: string,
  setCopied: (copied: boolean) => void,
  setCopyError: (error: boolean) => void,
  onLogCopyToClipboard?: () => void,
  logger?: any
) => {
  try {
    await navigator.clipboard.writeText(answer);
    setCopied(true);
    onLogCopyToClipboard?.();
  } catch (error) {
    setCopyError(true);
    logger?.error(`Failed to copy to clipboard: ${error}`);
  }

  setTimeout(() => {
    setCopied(false);
    setCopyError(false);
  }, 2000);
};

export const GeneratedAnswerWrapper: FunctionalComponent<{
  contentClasses?: string;
}> = ({ contentClasses }, children) => {
  const classes = contentClasses ||
    'mx-auto mt-0 mb-4 border border-neutral shadow-lg p-6 bg-background rounded-lg p-6 text-on-background';

  return (
    <div>
      <aside class={classes} part="container">
        <article>{children}</article>
      </aside>
    </div>
  );
};

const GeneratedAnswerHeader: FunctionalComponent<{
  i18n: i18n;
  isAnswerVisible: boolean;
  withToggle?: boolean;
  onToggle: (checked: boolean) => void;
}> = ({ i18n, isAnswerVisible, withToggle, onToggle }) => {
  const toggleTooltip = isAnswerVisible
    ? i18n.t('generated-answer-toggle-on')
    : i18n.t('generated-answer-toggle-off');
  return (
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
          checked={isAnswerVisible}
          onToggle={onToggle}
          ariaLabel={i18n.t('generated-answer-title')}
          title={toggleTooltip}
          withToggle={withToggle}
        ></Switch>
      </div>
    </div>
  );
};

const GeneratedAnswerFeedbackAndCopyButtons: FunctionalComponent<{
  copied: boolean;
  copyError: boolean;
  disliked?: boolean;
  hasClipboard: boolean;
  i18n: i18n;
  isStreaming?: boolean;
  liked?: boolean;
  withToggle?: boolean;
  onClickDislike: () => void;
  onClickLike: () => void;
  onCopyToClipboard: () => Promise<void>;
}> = ({
  copied,
  copyError,
  disliked,
  hasClipboard,
  i18n,
  isStreaming,
  liked,
  withToggle,
  onClickDislike,
  onClickLike,
  onCopyToClipboard,
}) => {
    const containerClasses = [
      'feedback-buttons',
      'flex',
      'h-9',
      'absolute',
      'top-6',
      'shrink-0',
      'gap-2',
      withToggle ? 'right-20' : 'right-6',
    ].join(' ');

    if (isStreaming) {
      return null;
    }

    const copyToClipboardTooltip = copyError
      ? i18n.t('failed-to-copy-generated-answer')
      : !copied
        ? i18n.t('copy-generated-answer')
        : i18n.t('generated-answer-copied');

    return (
      <div class={containerClasses}>
        <FeedbackButton
          title={i18n.t('this-answer-was-helpful')}
          variant="like"
          active={!!liked}
          onClick={onClickLike}
        />
        <FeedbackButton
          title={i18n.t('this-answer-was-not-helpful')}
          variant="dislike"
          active={!!disliked}
          onClick={onClickDislike}
        />
        {hasClipboard ? (
          <CopyButton
            title={copyToClipboardTooltip}
            isCopied={copied}
            error={copyError}
            onClick={onCopyToClipboard}
          />
        ) : null}
      </div>
    );
  };

const GeneratedAnswerCitations: FunctionalComponent<{
  citations?: GeneratedAnswerCitation[];
  disableCitationAnchoring?: boolean;
  buildInteractiveCitation?: (citation: GeneratedAnswerCitation) => InteractiveCitation;
  onLogCitationHover?: (citationId: string, citationHoverTimeMs: number) => void;
  i18n?: i18n;
}> = ({
  citations,
  disableCitationAnchoring,
  buildInteractiveCitation,
  onLogCitationHover,
  i18n,
}) => {
    if (!citations?.length) {
      return [];
    }

    const getCitation = (citation: GeneratedAnswerCitation) => {
      const { title } = citation;

      return title.trim() !== ''
        ? citation
        : { ...citation, title: i18n?.t ? i18n.t('no-title') : 'No title' };
    };

    return citations.map((citation: GeneratedAnswerCitation, index: number) => {
      const interactiveCitation = buildInteractiveCitation?.(citation);
      return (
        <li key={citation.id} class="max-w-full">
          <atomic-citation
            citation={getCitation(citation)}
            index={index}
            sendHoverEndEvent={(citationHoverTimeMs: number) => {
              onLogCitationHover?.(citation.id, citationHoverTimeMs);
            }}
            interactiveCitation={interactiveCitation!}
            disableCitationAnchoring={disableCitationAnchoring}
            exportparts="citation,citation-popover"
          />
        </li>
      );
    });
  };

const GeneratedAnswerDisclaimer: FunctionalComponent<{
  isStreaming?: boolean;
  i18n: i18n;
}> = ({ isStreaming, i18n }, children) => {
  if (isStreaming) {
    return null;
  }
  return (
    <div class="text-neutral-dark text-xs/[1rem]">
      {children || i18n.t('generated-answer-disclaimer')}
    </div>
  );
};

const GeneratedAnswerFooter: FunctionalComponent<{
  collapsible?: boolean;
  expanded?: boolean;
  i18n: i18n;
  isStreaming?: boolean;
  onShowButtonClick?: () => void;
}> = ({ collapsible, expanded, i18n, isStreaming, onShowButtonClick }, children) => {
  const showGeneratingLabel = collapsible && isStreaming;
  const showButton = collapsible && !isStreaming;

  return (
    <div part="generated-answer-footer" class="mt-6 flex justify-end">
      {showGeneratingLabel && (
        <div
          part="is-generating"
          class="text-primary hidden text-base font-light"
        >
          {i18n.t('generating-answer')}...
        </div>
      )}
      {showButton && onShowButtonClick && (
        <ShowButton
          i18n={i18n}
          onClick={onShowButtonClick}
          isCollapsed={!expanded}
        ></ShowButton>
      )}
      {children}
    </div>
  );
};

const GeneratedAnswerRetryPrompt: FunctionalComponent<{
  i18n: i18n;
  onRetry: () => void;
}> = ({ i18n, onRetry }) => {
  return (
    <RetryPrompt
      onClick={onRetry}
      buttonLabel={i18n.t('retry')}
      message={i18n.t('retry-stream-message')}
    />
  );
};

const GeneratedAnswerContent: FunctionalComponent<{
  copied: boolean;
  copyError: boolean;
  generatedAnswerState: GeneratedAnswerState;
  withToggle?: boolean;
  onClickDislike: () => void;
  onClickLike: () => void;
  onCopyToClipboard: () => Promise<void>;
  hasClipboard: boolean;
  disableCitationAnchoring?: boolean;
  buildInteractiveCitationForCitation: (citation: any) => InteractiveCitation;
  generatedAnswer: GeneratedAnswer;
  answer?: string;
  answerContentFormat?: string;
  citations?: GeneratedAnswerCitation[];
  i18n: i18n;
  isStreaming?: boolean;
}> = ({ answer, answerContentFormat, citations, i18n, isStreaming, copied, copyError, generatedAnswerState, withToggle, onClickDislike, onClickLike, onCopyToClipboard, hasClipboard, disableCitationAnchoring, buildInteractiveCitationForCitation, generatedAnswer }) => {
  return (
    <GeneratedContentContainer
      answer={answer}
      answerContentFormat={answerContentFormat}
      isStreaming={!!isStreaming}
    >
      <GeneratedAnswerFeedbackAndCopyButtons
        copied={copied}
        copyError={copyError}
        disliked={generatedAnswerState?.disliked}
        hasClipboard={hasClipboard}
        i18n={i18n}
        isStreaming={generatedAnswerState?.isStreaming}
        liked={generatedAnswerState?.liked}
        withToggle={withToggle}
        onClickDislike={onClickDislike}
        onClickLike={onClickLike}
        onCopyToClipboard={onCopyToClipboard} />
      <SourceCitations
        label={i18n.t('citations')}
        isVisible={!!citations?.length}
      >
        <GeneratedAnswerCitations
          citations={generatedAnswerState.citations}
          disableCitationAnchoring={disableCitationAnchoring}
          buildInteractiveCitation={buildInteractiveCitationForCitation}
          onLogCitationHover={(citationId, citationHoverTimeMs) => {
            generatedAnswer?.logCitationHover?.(citationId, citationHoverTimeMs);
          }}
          i18n={i18n} />
      </SourceCitations>
    </GeneratedContentContainer>
  );
};

export const GeneratedAnswerCommon: FunctionalComponent<{ collapsible?: boolean, onShowButtonClick: () => void, onClickDislike: () => void, onClickLike: () => void, onCopyToClipboard: () => Promise<void>, disableCitationAnchoring?: boolean, copied: boolean, i18n: i18n, copyError: boolean, generatedAnswer: GeneratedAnswer, generatedAnswerState: GeneratedAnswerState, withToggle?: boolean, isAnswerVisible: boolean, hasRetryableError: boolean, hasClipboard: boolean, buildInteractiveCitationForCitation: (citation: any) => InteractiveCitation }> = (
  { onShowButtonClick, onClickDislike, onClickLike, onCopyToClipboard, collapsible, disableCitationAnchoring, copied, i18n, copyError, generatedAnswer, generatedAnswerState, withToggle, isAnswerVisible, hasRetryableError, hasClipboard, buildInteractiveCitationForCitation }) => {
  return <GeneratedAnswerWrapper>
    <div part="generated-content">
      <GeneratedAnswerHeader
        i18n={i18n}
        isAnswerVisible={!!isAnswerVisible}
        withToggle={withToggle}
        onToggle={(checked) => {
          checked ? generatedAnswer?.show() : generatedAnswer?.hide();
        }} />

      {hasRetryableError && isAnswerVisible ? (
        <GeneratedAnswerRetryPrompt
          i18n={i18n}
          onRetry={() => generatedAnswer?.retry()} />
      ) : null}

      {!hasRetryableError && isAnswerVisible ? (
        <GeneratedAnswerContent
          answer={generatedAnswerState?.answer}
          answerContentFormat={generatedAnswerState?.answerContentFormat}
          citations={generatedAnswerState?.citations}
          i18n={i18n}
          isStreaming={generatedAnswerState?.isStreaming}
          copied={copied}
          copyError={copyError}
          generatedAnswerState={generatedAnswerState}
          withToggle={withToggle}
          onClickDislike={onClickDislike}
          onClickLike={onClickLike}
          onCopyToClipboard={onCopyToClipboard}
          hasClipboard={hasClipboard}
          disableCitationAnchoring={disableCitationAnchoring}
          buildInteractiveCitationForCitation={buildInteractiveCitationForCitation}
          generatedAnswer={generatedAnswer}
        />
      ) : null}

      {!hasRetryableError && isAnswerVisible && (
        <GeneratedAnswerFooter
          collapsible={collapsible}
          expanded={generatedAnswerState?.expanded}
          i18n={i18n}
          isStreaming={generatedAnswerState?.isStreaming}
          onShowButtonClick={onShowButtonClick}
        >
          <GeneratedAnswerDisclaimer
            isStreaming={generatedAnswerState?.isStreaming}
            i18n={i18n}
          >
            <slot name="disclaimer" slot="disclaimer">
              {i18n.t('generated-answer-disclaimer')}
            </slot>
          </GeneratedAnswerDisclaimer>
        </GeneratedAnswerFooter>
      )}
    </div>
  </GeneratedAnswerWrapper>;
} 

export const GeneratedAnswerNoAnswerMessage: FunctionalComponent<{
  i18n: i18n;
}> = ({ i18n }, children) => {
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
        {children}
      </div>
    </div>
  );
};