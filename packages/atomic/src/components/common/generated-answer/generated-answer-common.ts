import type {GeneratedAnswer, GeneratedAnswerState} from '@coveo/headless';
import type {i18n} from 'i18next';
import {
  type GeneratedAnswerData,
  SafeStorage,
  StorageItems,
} from '../../../utils/local-storage-utils.js';

export const readGeneratedAnswerStoredData = (
  withToggle?: boolean
): GeneratedAnswerData => {
  const storage = new SafeStorage();
  const storedData = storage.getParsedJSON<GeneratedAnswerData>(
    StorageItems.GENERATED_ANSWER_DATA,
    {isVisible: true}
  );

  // This check ensures that the answer is visible when the toggle is hidden and visible is set to false in the local storage.
  return {isVisible: (withToggle && storedData.isVisible) || !withToggle};
};

export const writeGeneratedAnswerStoredData = (data: GeneratedAnswerData) => {
  const storage = new SafeStorage();
  storage.setJSON(StorageItems.GENERATED_ANSWER_DATA, data);
};

export const insertGeneratedAnswerFeedbackModal = (
  host: HTMLElement,
  generatedAnswer?: () => GeneratedAnswer
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
  logger?: Pick<Console, 'error'>
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
