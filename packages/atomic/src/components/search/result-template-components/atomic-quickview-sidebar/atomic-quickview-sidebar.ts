import type {i18n} from 'i18next';
import {html, nothing} from 'lit';
import {when} from 'lit/directives/when.js';
import type {FunctionalComponent} from '@/src/utils/functional-component-utils';
import type {HighlightKeywords} from '../atomic-quickview-modal/atomic-quickview-modal';
import type {QuickviewWordHighlight} from '../quickview-word-highlight/quickview-word-highlight';
import {renderHighlightKeywordsCheckbox} from './highlight-keywords-checkbox';
import {renderKeywords} from './keywords';
import {renderMinimizeButton} from './minimize-button';

interface QuickviewSidebarProps {
  words: Record<string, QuickviewWordHighlight>;
  i18n: i18n;
  highlightKeywords: HighlightKeywords;
  onHighlightKeywords: (highlight: HighlightKeywords) => void;
  minimized: boolean;
  onMinimize: (minimize: boolean) => void;
}

export const renderQuickviewSidebar: FunctionalComponent<
  QuickviewSidebarProps
> = ({props}) => {
  const numberOfWords = Object.values(props.words).length;

  if (numberOfWords === 0) {
    return nothing;
  }

  return html`
    <div class="border-neutral h-full border-r p-4">
      ${when(props.minimized, () =>
        renderMinimizeButton({
          props: {
            i18n: props.i18n,
            minimized: props.minimized,
            onMinimize: props.onMinimize,
            highlightKeywords: props.highlightKeywords,
            wordsLength: numberOfWords,
          },
        })
      )}
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          ${renderHighlightKeywordsCheckbox({props})}
        </div>
        ${when(
          !props.minimized,
          () => html`
            <div>
              ${renderMinimizeButton({
                props: {
                  i18n: props.i18n,
                  minimized: props.minimized,
                  onMinimize: props.onMinimize,
                  highlightKeywords: props.highlightKeywords,
                  wordsLength: numberOfWords,
                },
              })}
            </div>
          `
        )}
      </div>

      ${when(!props.minimized, () =>
        renderKeywords({
          props: {
            i18n: props.i18n,
            highlightKeywords: props.highlightKeywords,
            onHighlightKeywords: props.onHighlightKeywords,
            words: props.words,
          },
        })
      )}
    </div>
  `;
};
