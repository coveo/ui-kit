import {Fragment, FunctionalComponent, h} from '@stencil/core';
import {i18n} from 'i18next';
import Add from '../../../../images/add.svg';
import ArrowDown from '../../../../images/arrow-bottom-rounded.svg';
import ArrowUp from '../../../../images/arrow-top-rounded.svg';
import MinimizeIcon from '../../../../images/menu.svg';
import Remove from '../../../../images/remove.svg';
import {IconButton} from '../../../common/stencil-iconButton';
import {StencilCheckbox} from '../../../common/stencil-checkbox';
import {FieldsetGroup} from '../../../common/stencil-fieldset-group';
import type {HighlightKeywords} from '../atomic-quickview-modal/atomic-quickview-modal';
import {QuickviewWordHighlight} from '../quickview-word-highlight/quickview-word-highlight';

const identifierKeywordsSection = 'coveo-quickview-sidebar-keywords';

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

const MinimizeButton: FunctionalComponent<
  Pick<
    QuickviewSidebarProps,
    'i18n' | 'minimized' | 'onMinimize' | 'highlightKeywords'
  > & {wordsLength: number}
> = ({i18n, minimized, onMinimize, highlightKeywords, wordsLength}) => (
  <IconButton
    partPrefix="sidebar-minimize"
    icon={MinimizeIcon}
    style="text-transparent"
    title={i18n.t('quickview-toggle-navigation')}
    ariaLabel={i18n.t('quickview-toggle-navigation')}
    onClick={() => onMinimize(!minimized)}
    badge={
      highlightKeywords && minimized ? <slot>{wordsLength}</slot> : undefined
    }
    class={`w-fit ${minimized ? '' : 'ml-auto'}`}
    ariaExpanded={(!minimized).toString()}
    ariaControls={identifierKeywordsSection}
  />
);

const HighlightKeywordsCheckbox: FunctionalComponent<
  Pick<
    QuickviewSidebarProps,
    'i18n' | 'highlightKeywords' | 'onHighlightKeywords' | 'minimized'
  >
> = ({i18n, highlightKeywords, onHighlightKeywords, minimized}) => (
  <Fragment>
    <StencilCheckbox
      text={i18n.t('keywords-highlight')}
      class="mr-2"
      id="atomic-quickview-sidebar-highlight-keywords"
      checked={!highlightKeywords.highlightNone}
      onToggle={(checked) =>
        onHighlightKeywords({
          ...highlightKeywords,
          highlightNone: !checked,
        })
      }
    ></StencilCheckbox>
    {!minimized && (
      <label
        class="cursor-pointer font-bold whitespace-nowrap"
        htmlFor="atomic-quickview-sidebar-highlight-keywords"
      >
        {i18n.t('keywords-highlight')}
      </label>
    )}
  </Fragment>
);

const Keywords: FunctionalComponent<
  Pick<
    QuickviewSidebarProps,
    'i18n' | 'onHighlightKeywords' | 'highlightKeywords'
  > & {
    words: Record<string, QuickviewWordHighlight>;
  }
> = ({words, i18n, highlightKeywords, onHighlightKeywords}) => {
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
