import type {i18n} from 'i18next';
import type {FunctionalComponent} from '@/src/utils/functional-component-utils';
import {renderButton} from '../button';

export interface CancelButtonProps {
  i18n: i18n;
  onClick: () => void;
}

export const renderCancelButton: FunctionalComponent<CancelButtonProps> = ({
  props,
}) =>
  renderButton({
    props: {
      style: 'primary',
      part: 'cancel-button',
      text: props.i18n.t('cancel-last-action'),
      onClick: () => props.onClick(),
      class: 'my-3 px-2.5 py-3 font-bold',
    },
  })();
