import type {GeneratedAnswerCitation} from '@coveo/headless';
import type {I18n} from '@/src/components/common/interface/i18n';

/**
 * Normalizes a citation by ensuring it has a title.
 * If the title is empty, returns a fallback title from i18n.
 */
export function getCitationWithTitle(
  citation: GeneratedAnswerCitation,
  i18n: I18n
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
