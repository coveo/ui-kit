import {FunctionalComponent, h} from '@stencil/core';
import {i18n} from 'i18next';
import Add from '../../../../images/add.svg';
import ArrowDown from '../../../../images/arrow-bottom-rounded.svg';
import ArrowUp from '../../../../images/arrow-top-rounded.svg';
import Remove from '../../../../images/remove.svg';
import {IconButton} from '../../../common/stencil-iconButton';
import {FieldsetGroup} from '../../../common/stencil-fieldset-group';
import type {HighlightKeywords} from '../atomic-quickview-modal/atomic-quickview-modal';
import {QuickviewWordHighlight} from '../quickview-word-highlight/quickview-word-highlight';

export const identifierKeywordsSection = 'coveo-quickview-sidebar-keywords';

/**
 * @internal
 */
export const Keywords: FunctionalComponent<{
  i18n: i18n;
  onHighlightKeywords: (highlight: HighlightKeywords) => void;
  highlightKeywords: HighlightKeywords;
  words: Record<string, QuickviewWordHighlight>;
}> = ({words, i18n, highlightKeywords, onHighlightKeywords}) => {
  return (
    <div id={identifierKeywordsSection}>
      {Object.values(words).map((keyword) => {
        const wordIsEnabled =
          !highlightKeywords.highlightNone &&
          (highlightKeywords.keywords[keyword.text] === undefined ||
            highlightKeywords.keywords[keyword.text].enabled === true);

        return (
          <div
            key={keyword.text}
            class="my-4 flex w-100 items-center justify-between gap-x-2"
          >
            <div
              class={`bg-background border-neutral flex grow items-center overflow-x-auto rounded-lg border ${
                !wordIsEnabled ? 'pointer-events-none opacity-50' : ''
              }`}
            >
              <div
                class="flex grow items-center border-r p-4"
                aria-hidden="true"
              >
                <div
                  class="mr-2 h-5 w-5 flex-none"
                  style={{backgroundColor: keyword.color}}
                ></div>
                <div class="mr-2 grow whitespace-nowrap">{keyword.text}</div>
                <div class="flex-none">
                  (
                  {new Intl.NumberFormat(i18n.language, {
                    notation: 'compact',
                  }).format(keyword.occurrences)}
                  )
                </div>
              </div>
              <FieldsetGroup
                label={i18n.t('quickview-navigate-keywords', {
                  occurrences: keyword.occurrences,
                  keyword: keyword.text,
                })}
              >
                <div class="flex px-2">
                  <IconButton
                    partPrefix="sidebar-next"
                    icon={ArrowDown}
                    disabled={!wordIsEnabled}
                    style="text-transparent"
                    class="border-0"
                    ariaLabel={i18n.t('next')}
                    title={i18n.t('next')}
                    onClick={() => keyword.navigateForward()}
                  />
                  <IconButton
                    partPrefix="sidebar-previous"
                    icon={ArrowUp}
                    disabled={!wordIsEnabled}
                    style="text-transparent"
                    class="border-0"
                    ariaLabel={i18n.t('previous')}
                    title={i18n.t('previous')}
                    onClick={() => keyword.navigateBackward()}
                  />
                </div>
              </FieldsetGroup>
            </div>
            <IconButton
              partPrefix="sidebar-remove-word"
              class={`${
                highlightKeywords.highlightNone
                  ? 'pointer-events-none opacity-50'
                  : ''
              }`}
              tabIndex={highlightKeywords.highlightNone ? '-1' : '0'}
              ariaPressed={(!wordIsEnabled).toString()}
              style="text-transparent"
              icon={wordIsEnabled ? Remove : Add}
              ariaLabel={i18n.t('quickview-remove-word')}
              onClick={() => {
                onHighlightKeywords({
                  ...highlightKeywords,
                  keywords: {
                    ...highlightKeywords.keywords,
                    [keyword.text]: {
                      enabled: !wordIsEnabled,
                      indexIdentifier: keyword.indexIdentifier,
                    },
                  },
                });
              }}
            />
          </div>
        );
      })}
    </div>
  );
};
