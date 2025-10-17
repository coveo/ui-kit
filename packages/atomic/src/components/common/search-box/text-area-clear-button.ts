import type {i18n} from 'i18next';
import {html} from 'lit';
import type {Ref} from 'lit/directives/ref.js';
import type {FunctionalComponent} from '@/src/utils/functional-component-utils';
import ClearSlim from '../../../images/clear-slim.svg';
import {renderButton} from '../button';

interface Props {
  i18n: i18n;
  textAreaRef: Ref<HTMLTextAreaElement>;
  onClick: () => void;
}

export const renderTextAreaClearButton: FunctionalComponent<Props> = ({
  props: {textAreaRef, i18n, onClick},
}) => {
  return html`<div
    part="clear-button-wrapper"
    class="ml-2 flex items-center justify-center py-2"
  >
    ${renderButton({
      props: {
        style: 'text-transparent',
        part: 'clear-button',
        class:
          'text-neutral-dark flex h-8 w-8 shrink-0 items-center justify-center',
        onClick: () => {
          onClick?.();
          textAreaRef?.value?.focus();
        },
        ariaLabel: i18n.t('clear-searchbox'),
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
