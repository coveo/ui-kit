import type {i18n} from 'i18next';
import {html} from 'lit';
import {renderHeading} from '@/src/components/common/heading';
import type {FunctionalComponent} from '@/src/utils/functional-component-utils';

export interface RenderCustomNoAnswerMessageProps {
  i18n: i18n;
}

/**
 * Renders the custom "no answer" message container.
 */
export const renderCustomNoAnswerMessage: FunctionalComponent<
  RenderCustomNoAnswerMessageProps
> = ({props}) => {
  const {i18n} = props;

  return html`
    <div part="generated-content">
      <div class="flex items-center">
        ${renderHeading({
          props: {
            level: 0,
            part: 'header-label',
            class:
              'text-primary bg-primary-background inline-block rounded-md px-2.5 py-2 font-medium',
          },
        })(html`${i18n.t('generated-answer-title')}`)}
      </div>
      <div part="generated-container" class="mt-6 break-words">
        <slot name="no-answer-message"></slot>
      </div>
    </div>
  `;
};
