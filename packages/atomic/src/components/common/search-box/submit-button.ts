import {FunctionalComponent} from '@/src/utils/functional-component-utils';
import {i18n} from 'i18next';
import {html} from 'lit';
import SearchSlimIcon from '../../../images/search-slim.svg';
import {renderButton, ButtonProps} from '../button';

interface Props extends Partial<ButtonProps> {
  i18n: i18n;
}

export const renderSubmitButton: FunctionalComponent<Props> = ({props}) => {
  return html`<div
    part="submit-button-wrapper"
    class="mr-2 flex items-center justify-center py-2"
  >
    ${renderButton({
      props: {
        style: 'text-primary',
        class: 'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
        part: 'submit-button',
        ariaLabel: props.i18n.t('search'),
        onClick: () => {
          props.onClick?.();
        },
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
