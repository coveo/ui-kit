import type {i18n} from 'i18next';
import {html} from 'lit';
import {renderHeading} from '@/src/components/common/heading';
import {renderSwitch} from '@/src/components/common/switch';
import type {FunctionalComponent} from '@/src/utils/functional-component-utils';
import '@/src/components/common/atomic-icon/atomic-icon';

export interface RenderCustomNoAnswerMessageProps {
  i18n: i18n;

  /**
   * Whether the generated answer container is currently visible.
   */
  isAnswerVisible: boolean;

  /**
   * The tooltip text shown on the visibility toggle.
   */
  toggleTooltip: string;

  /**
   * Whether to render a toggle control that lets the user hide or show the content.
   */
  withToggle: boolean;

  /**
   * Callback invoked when the user toggles the visibility.
   */
  onToggle: (checked: boolean) => void;
}

/**
 * Renders the custom "no answer" message container.
 */
export const renderCustomNoAnswerMessage: FunctionalComponent<
  RenderCustomNoAnswerMessageProps
> = ({props}) => {
  const {i18n, isAnswerVisible, toggleTooltip, withToggle, onToggle} = props;

  return html`
    <div part="generated-content">
      <div
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
            class:
              'text-primary inline-block rounded-md px-2.5 py-2 font-medium',
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
      </div>
      <div part="generated-container" class="p-6 break-words">
        <slot name="no-answer-message"></slot>
      </div>
    </div>
  `;
};
