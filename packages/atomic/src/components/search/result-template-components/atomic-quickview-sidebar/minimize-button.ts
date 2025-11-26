import type {i18n} from 'i18next';
import {html} from 'lit';
import {renderIconButton} from '@/src/components/common/icon-button';
import type {HighlightKeywords} from '@/src/components/search/result-template-components/atomic-quickview-modal/atomic-quickview-modal';
import type {FunctionalComponent} from '@/src/utils/functional-component-utils';
import MinimizeIcon from '../../../../images/menu.svg';
import {identifierKeywordsSection} from './keywords';

export interface MinimizeButtonProps {
  i18n: i18n;
  minimized: boolean;
  onMinimize: (minimize: boolean) => void;
  highlightKeywords: HighlightKeywords;
  wordsLength: number;
}

export const renderMinimizeButton: FunctionalComponent<MinimizeButtonProps> = ({
  props,
}) => {
  const className = props.minimized ? 'w-fit' : 'ml-auto w-fit';

  return renderIconButton({
    props: {
      partPrefix: 'sidebar-minimize',
      icon: MinimizeIcon,
      style: 'text-transparent',
      title: props.i18n.t('quickview-toggle-navigation'),
      ariaLabel: props.i18n.t('quickview-toggle-navigation'),
      onClick: () => props.onMinimize(!props.minimized),
      badge:
        props.highlightKeywords && props.minimized
          ? html`<slot>${props.wordsLength}</slot>`
          : undefined,
      class: className,
      ariaExpanded: (!props.minimized).toString() as 'true' | 'false',
      ariaControls: identifierKeywordsSection,
    },
  });
};
