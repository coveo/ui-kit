import {FunctionalComponent, h} from '@stencil/core';
import {i18n} from 'i18next';
import ArrowBottomIcon from '../../../images/arrow-bottom-rounded.svg';
import ArrowTopIcon from '../../../images/arrow-top-rounded.svg';
import {Button} from '../button';

interface ShowButtonProps {
  i18n: i18n;
  isCollapsed: boolean;
  onClick: () => void;
  isStreaming?: boolean;
  collapsable?: boolean;
}

export const ShowButton: FunctionalComponent<ShowButtonProps> = (props) => {
  const btnClasses = 'hidden items-center hover:bg-transparent';

  return (
    <Button
      style="text-primary"
      part="answer-show-button"
      class={`${btnClasses} ${props.collapsable ? (props.isStreaming ? 'flex invisible' : 'flex') : 'hidden'}`}
      onClick={() => props.onClick()}
    >
      <div class="font-light text-base">
        {props.isCollapsed
          ? props.i18n.t('show-more')
          : props.i18n.t('show-less')}
      </div>
      <atomic-icon
        part="answer-show-icon"
        class="w-3.5 ml-2"
        icon={props.isCollapsed ? ArrowBottomIcon : ArrowTopIcon}
      ></atomic-icon>
    </Button>
  );
};
