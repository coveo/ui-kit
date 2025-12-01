import {FunctionalComponent, h} from '@stencil/core';
import {i18n} from 'i18next';
import {StencilCheckbox} from '../../../common/stencil-checkbox';
import type {HighlightKeywords} from '../atomic-quickview-modal/atomic-quickview-modal';

/**
 * @internal
 */
export const HighlightKeywordsCheckbox: FunctionalComponent<{
  i18n: i18n;
  highlightKeywords: HighlightKeywords;
  onHighlightKeywords: (highlight: HighlightKeywords) => void;
  minimized: boolean;
}> = ({i18n, highlightKeywords, onHighlightKeywords, minimized}) => [
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
  ></StencilCheckbox>,
  !minimized && (
    <label
      class="cursor-pointer font-bold whitespace-nowrap"
      htmlFor="atomic-quickview-sidebar-highlight-keywords"
    >
      {i18n.t('keywords-highlight')}
    </label>
  ),
];
