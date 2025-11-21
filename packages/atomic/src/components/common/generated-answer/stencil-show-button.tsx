import {FunctionalComponent, h} from '@stencil/core';
import {i18n} from 'i18next';
import ArrowBottomIcon from '../../../images/arrow-bottom-rounded.svg';
import ArrowTopIcon from '../../../images/arrow-top-rounded.svg';
import {Button} from '../stencil-button';

interface ShowButtonProps {
  i18n: i18n;
  isCollapsed: boolean;
  onClick: () => void;
}

/**
 * @deprecated should only be used for Stencil components.
 */
export const ShowButton: FunctionalComponent<ShowButtonProps> = (props) => (
  <Button
    style="text-primary"
    part="answer-show-button"
    class="hidden items-center hover:bg-transparent"
    onClick={() => props.onClick()}
  >
    <div class="text-base font-light">
      {props.isCollapsed
        ? props.i18n.t('show-more')
        : props.i18n.t('show-less')}
    </div>
    <atomic-icon
      part="answer-show-icon"
      class="ml-2 w-3.5"
      icon={props.isCollapsed ? ArrowBottomIcon : ArrowTopIcon}
    ></atomic-icon>
  </Button>
);
