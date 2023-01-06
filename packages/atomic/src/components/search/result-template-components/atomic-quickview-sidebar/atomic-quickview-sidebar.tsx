import {Result, TermsToHighlight} from '@coveo/headless';
import {Fragment, FunctionalComponent, h} from '@stencil/core';
import {i18n} from 'i18next';
import ArrowDown from '../../../../images/arrow-bottom-rounded.svg';
import ArrowUp from '../../../../images/arrow-top-rounded.svg';
import MinimizeIcon from '../../../../images/menu.svg';
import {Checkbox} from '../../../common/checkbox';
import {
  getWordsHighlights,
  QuickviewWordHighlight,
} from '../quickview-word-highlight/quickview-word-highlight';

export interface QuickviewSidebarProps {
  iframe: HTMLIFrameElement;
  termsToHighlight: TermsToHighlight;
  i18n: i18n;
  highlightKeywords: boolean;
  onHighlightKeywords: (doHighlight: boolean) => void;
  minimized: boolean;
  onMinimize: (minimize: boolean) => void;
  result: Result;
}

export const QuickviewSidebar: FunctionalComponent<QuickviewSidebarProps> = (
  props
) => {
  const {iframe, termsToHighlight, highlightKeywords, minimized} = props;

  const words = getWordsHighlights(iframe, termsToHighlight);

  const minimizeButton = (
    <MinimizeButton {...props} wordsLength={Object.values(words).length} />
  );

  return (
    <div
      class="p-4 border-r border-neutral h-full"
      style={{backgroundColor: 'var(--atomic-neutral-light)'}}
    >
      {minimized && minimizeButton}
      <div class="flex items-center">
        <HighlightKeywordsCheckbox {...props} />
        {!minimized && minimizeButton}
      </div>

      {highlightKeywords && !minimized && (
        <KeywordsNavigation {...props} words={words} />
      )}
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
      checked={highlightKeywords}
      onToggle={onHighlightKeywords}
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

const KeywordsNavigation: FunctionalComponent<
  Pick<QuickviewSidebarProps, 'i18n'> & {
    words: Record<string, QuickviewWordHighlight>;
  }
> = ({words, i18n}) => {
  return (
    <Fragment>
      {Object.values(words).map((keyword) => {
        return (
          <div
            key={keyword.text}
            class="flex items-center w-100 my-4 bg-background border border-neutral rounded-lg overflow-x-auto"
          >
            <div class="flex items-center grow p-4 border-r">
              <div
                class="w-5 h-5 flex-none mr-2"
                style={{backgroundColor: keyword.color}}
              ></div>
              <div class="grow mr-2">{keyword.text}</div>
              <div class="flex-none">{keyword.occurrences}</div>
            </div>
            <div class="flex px-2">
              <atomic-icon-button
                buttonStyle="text-transparent"
                class="mr-2 border-0"
                labelI18nKey="next"
                tooltip={i18n.t('next')}
                icon={ArrowDown}
                clickCallback={() => {
                  keyword.navigateForward();
                }}
              ></atomic-icon-button>
              <atomic-icon-button
                buttonStyle="text-transparent"
                class="border-0"
                labelI18nKey="previous"
                tooltip={i18n.t('previous')}
                icon={ArrowUp}
                clickCallback={() => keyword.navigateBackward()}
              ></atomic-icon-button>
            </div>
          </div>
        );
      })}
    </Fragment>
  );
};
