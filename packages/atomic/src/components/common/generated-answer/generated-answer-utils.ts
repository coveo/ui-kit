import type {GeneratedAnswerCitation} from '@coveo/headless';
import type {i18n} from 'i18next';

/**
 * Normalizes a citation by ensuring it has a title.
 * If the title is empty, returns a fallback title from i18n.
 */
export function getCitationWithTitle(
  citation: GeneratedAnswerCitation,
  i18n: i18n
): GeneratedAnswerCitation {
  const {title} = citation;
  return title.trim() !== ''
    ? citation
    : {...citation, title: i18n.t('no-title')};
}

/**
 * Checks if the Clipboard API is available.
 */
export function hasClipboardSupport(): boolean {
  return !!navigator?.clipboard?.writeText;
}
