import type {i18n} from 'i18next';
import {html} from 'lit';
import {when} from 'lit/directives/when.js';
import {renderButton} from '@/src/components/common/button';
import type {FunctionalComponent} from '@/src/utils/functional-component-utils';
import ArrowBottomIcon from '../../../images/arrow-bottom-rounded.svg';
import ArrowTopIcon from '../../../images/arrow-top-rounded.svg';

export interface ShowButtonProps {
  i18n: i18n;
  isCollapsed: boolean;
  onClick: () => void;
}

export const renderShowButton: FunctionalComponent<ShowButtonProps> = ({
  props,
}) => {
  return html`${renderButton({
    props: {
      style: 'text-primary',
      part: 'answer-show-button',
      class: 'hidden items-center hover:bg-transparent',
      onClick: props.onClick,
    },
  })(html`
    <div class="text-base font-light">
      ${when(
        props.isCollapsed,
        () => props.i18n.t('show-more'),
        () => props.i18n.t('show-less')
      )}
    </div>
    <atomic-icon
      part="answer-show-icon"
      class="ml-2 w-3.5"
      icon=${props.isCollapsed ? ArrowBottomIcon : ArrowTopIcon}
    ></atomic-icon>
  `)}`;
};
