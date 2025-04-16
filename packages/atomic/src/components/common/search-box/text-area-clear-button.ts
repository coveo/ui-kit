import {FunctionalComponent} from '@/src/utils/functional-component-utils';
import {i18n} from 'i18next';
import {html} from 'lit';
import ClearSlim from '../../../images/clear-slim.svg';
import {button, ButtonProps} from '../button';

interface Props extends Partial<ButtonProps> {
  i18n: i18n;
  textAreaRef: HTMLTextAreaElement | null;
}

export const textAreaClearButton: FunctionalComponent<Props> = ({
  props: {textAreaRef, i18n, onClick},
}) => {
  return html`<div
    part="clear-button-wrapper"
    class="ml-2 flex items-center justify-center py-2"
  >
    ${button({
      props: {
        style: 'text-transparent',
        part: 'clear-button',
        class:
          'text-neutral-dark flex h-8 w-8 shrink-0 items-center justify-center',
        onClick: () => {
          onClick?.();
          textAreaRef?.focus();
        },
        ariaLabel: i18n.t('clear'),
      },
    })(
      html`<atomic-icon
        part="clear-icon"
        icon=${ClearSlim}
        class="h-4 w-4"
      ></atomic-icon>`
    )}
  </div>`;
};
