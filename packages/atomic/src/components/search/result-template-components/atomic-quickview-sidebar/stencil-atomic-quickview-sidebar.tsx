import {FunctionalComponent, h} from '@stencil/core';
import {i18n} from 'i18next';
import type {HighlightKeywords} from '../atomic-quickview-modal/atomic-quickview-modal';
import {QuickviewWordHighlight} from '../quickview-word-highlight/quickview-word-highlight';
import {HighlightKeywordsCheckbox} from './stencil-highlight-keywords-checkbox';
import {Keywords} from './stencil-keywords';
import {MinimizeButton} from './stencil-minimize-button';

interface QuickviewSidebarProps {
  words: Record<string, QuickviewWordHighlight>;
  i18n: i18n;
  highlightKeywords: HighlightKeywords;
  onHighlightKeywords: (highlight: HighlightKeywords) => void;
  minimized: boolean;
  onMinimize: (minimize: boolean) => void;
}

/**
 * @deprecated should only be used for Stencil components.
 */
export const QuickviewSidebar: FunctionalComponent<QuickviewSidebarProps> = (
  props
) => {
  const {words, minimized} = props;
  const numberOfWords = Object.values(words).length;

  if (numberOfWords === 0) {
    return;
  }

  const minimizeButton = (
    <MinimizeButton {...props} wordsLength={numberOfWords} />
  );

  return (
    <div class="border-neutral h-full border-r p-4">
      {minimized && minimizeButton}
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <HighlightKeywordsCheckbox {...props} />
        </div>
        {!minimized && <div>{minimizeButton}</div>}
      </div>

      {!minimized && <Keywords {...props} words={words} />}
    </div>
  );
};
