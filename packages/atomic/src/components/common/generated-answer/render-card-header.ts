import type {i18n} from 'i18next';
import {html} from 'lit';
import type {FunctionalComponent} from '@/src/utils/functional-component-utils';
import '@/src/components/common/atomic-icon/atomic-icon';
import {renderHeading} from '@/src/components/common/heading';
import {renderSwitch} from '@/src/components/common/switch';

export interface RenderCardHeaderProps {
  i18n: i18n;
  isAnswerVisible: boolean;
  toggleTooltip: string;
  withToggle: boolean;
  onToggle: (checked: boolean) => void;
}

/**
 * Renders the card header for the generated answer.
 */
export const renderCardHeader: FunctionalComponent<RenderCardHeaderProps> = ({
  props,
}) => {
  const {i18n, isAnswerVisible, toggleTooltip, withToggle, onToggle} = props;

  return html` <div
    part="header"
    class="flex items-center ${
      isAnswerVisible ? 'border-b-1 border-gray-200' : ''
    } px-6 py-3"
  >
    <atomic-icon
      part="header-icon"
      class="text-primary h-4 w-4 fill-current"
      .icon=${'assets://sparkles.svg'}
    >
    </atomic-icon>
    ${renderHeading({
      props: {
        level: 0,
        part: 'header-label',
        class: 'text-primary inline-block rounded-md px-2.5 py-2 font-medium',
      },
    })(html`${i18n.t('generated-answer-title')}`)}
    <div class="ml-auto flex h-9 items-center">
      ${renderSwitch({
        props: {
          part: 'toggle',
          checked: isAnswerVisible,
          onToggle,
          ariaLabel: i18n.t('generated-answer-title'),
          title: toggleTooltip,
          withToggle,
          tabIndex: 0,
        },
      })}
    </div>
  </div>`;
};
