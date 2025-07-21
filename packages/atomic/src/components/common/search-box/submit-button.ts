import type {i18n} from 'i18next';
import {html} from 'lit';
import type {FunctionalComponent} from '@/src/utils/functional-component-utils';
import SearchSlimIcon from '../../../images/search-slim.svg';
import {renderButton} from '../button';

interface Props {
  i18n: i18n;
  disabled: boolean;
  onClick: () => void;
}

export const renderSubmitButton: FunctionalComponent<Props> = ({props}) => {
  const {i18n, disabled, onClick} = props;
  return html`<div
    part="submit-button-wrapper"
    class="mr-2 flex items-center justify-center py-2"
  >
    ${renderButton({
      props: {
        style: 'text-primary',
        class: 'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
        part: 'submit-button',
        ariaLabel: i18n.t('search'),
        onClick: () => {
          onClick?.();
        },
        disabled,
      },
    })(
      html`<atomic-icon
        part="submit-icon"
        icon=${SearchSlimIcon}
        class="h-4 w-4"
      ></atomic-icon>`
    )}
  </div>`;
};
