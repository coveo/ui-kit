import {Fragment, FunctionalComponent, h} from '@stencil/core';
import {i18n} from 'i18next';
import Add from '../../../../images/add.svg';
import ArrowDown from '../../../../images/arrow-bottom-rounded.svg';
import ArrowUp from '../../../../images/arrow-top-rounded.svg';
import MinimizeIcon from '../../../../images/menu.svg';
import Remove from '../../../../images/remove.svg';
import {Checkbox} from '../../../common/checkbox';
import type {HighlightKeywords} from '../atomic-quickview-modal/atomic-quickview-modal';
import {QuickviewWordHighlight} from '../quickview-word-highlight/quickview-word-highlight';

export interface QuickviewSidebarProps {
  words: Record<string, QuickviewWordHighlight>;
  i18n: i18n;
  highlightKeywords: HighlightKeywords;
  onHighlightKeywords: (highlight: HighlightKeywords) => void;
  minimized: boolean;
  onMinimize: (minimize: boolean) => void;
}

export const QuickviewSidebar: FunctionalComponent<QuickviewSidebarProps> = (
  props
) => {
  const {words, minimized} = props;

  const minimizeButton = (
    <MinimizeButton {...props} wordsLength={Object.values(words).length} />
  );

  return (
    <div class="p-4 border-r border-neutral h-full">
      {minimized && minimizeButton}
      <div class="flex items-center">
        <HighlightKeywordsCheckbox {...props} />
        {!minimized && minimizeButton}
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
  <atomic-icon-button
    buttonStyle="text-transparent"
    class={`w-fit ${minimized ? '' : 'ml-auto'}`}
    icon={MinimizeIcon}
    labelI18nKey="minimize"
    tooltip={i18n.t('minimize')}
    clickCallback={() => onMinimize(!minimized)}
    badge={
      highlightKeywords && minimized ? <slot>{wordsLength}</slot> : undefined
    }
  ></atomic-icon-button>
);

const HighlightKeywordsCheckbox: FunctionalComponent<
  Pick<
    QuickviewSidebarProps,
    'i18n' | 'highlightKeywords' | 'onHighlightKeywords' | 'minimized'
  >
> = ({i18n, highlightKeywords, onHighlightKeywords, minimized}) => (
  <Fragment>
    <Checkbox
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
    ></Checkbox>
    {!minimized && (
      <label
        class="font-bold cursor-pointer whitespace-nowrap"
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
    <Fragment>
      {Object.values(words).map((keyword) => {
        const wordIsEnabled =
          !highlightKeywords.highlightNone &&
          (highlightKeywords.keywords[keyword.text] === undefined ||
            highlightKeywords.keywords[keyword.text].enabled === true);

        return (
          <div
            key={keyword.text}
            class="flex items-center justify-between gap-x-2 my-4 w-100"
          >
            <div
              class={`flex grow items-center bg-background border border-neutral rounded-lg overflow-x-auto ${
                !wordIsEnabled ? 'pointer-events-none opacity-50' : ''
              }`}
            >
              <div class="flex items-center grow p-4 border-r">
                <div
                  class="w-5 h-5 flex-none mr-2"
                  style={{backgroundColor: keyword.color}}
                ></div>
                <div class="grow mr-2">{keyword.text}</div>
                <div class="flex-none">
                  {new Intl.NumberFormat(i18n.language, {
                    notation: 'compact',
                  }).format(keyword.occurrences)}
                </div>
              </div>
              <div class="flex px-2">
                <atomic-icon-button
                  disabled={!wordIsEnabled}
                  buttonStyle="text-transparent"
                  class="border-0"
                  labelI18nKey="next"
                  tooltip={i18n.t('next')}
                  icon={ArrowDown}
                  clickCallback={() => {
                    keyword.navigateForward();
                  }}
                ></atomic-icon-button>
                <atomic-icon-button
                  disabled={!wordIsEnabled}
                  buttonStyle="text-transparent"
                  class="border-0"
                  labelI18nKey="previous"
                  tooltip={i18n.t('previous')}
                  icon={ArrowUp}
                  clickCallback={() => keyword.navigateBackward()}
                ></atomic-icon-button>
              </div>
            </div>

            <atomic-icon-button
              class={`${
                highlightKeywords.highlightNone
                  ? 'pointer-events-none opacity-50'
                  : ''
              }`}
              ariaPressed={!wordIsEnabled}
              buttonStyle="text-transparent"
              icon={wordIsEnabled ? Remove : Add}
              labelI18nKey={'quickview-remove-word'}
              clickCallback={() => {
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
            ></atomic-icon-button>
          </div>
        );
      })}
    </Fragment>
  );
};
