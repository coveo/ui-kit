import {FunctionalComponent, h} from '@stencil/core';
import {i18n} from 'i18next';
import MinimizeIcon from '../../../../images/menu.svg';
import {IconButton} from '../../../common/stencil-iconButton';
import type {HighlightKeywords} from '../atomic-quickview-modal/atomic-quickview-modal';
import {identifierKeywordsSection} from './stencil-keywords';

/**
 * @internal
 */
export const MinimizeButton: FunctionalComponent<{
  i18n: i18n;
  minimized: boolean;
  onMinimize: (minimize: boolean) => void;
  highlightKeywords: HighlightKeywords;
  wordsLength: number;
}> = ({i18n, minimized, onMinimize, highlightKeywords, wordsLength}) => (
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
