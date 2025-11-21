import type {i18n} from 'i18next';
import {nothing} from 'lit';
import {renderButton} from '@/src/components/common/button.js';
import type {FunctionalComponent} from '@/src/utils/functional-component-utils';

export interface CancelProps {
  i18n: i18n;
  onClick: () => void;
}

export const renderCancel: FunctionalComponent<CancelProps> = ({props}) =>
  renderButton({
    props: {
      style: 'primary',
      part: 'cancel-button',
      text: props.i18n.t('cancel-last-action'),
      onClick: props.onClick,
      class: 'my-3 px-2.5 py-3 font-bold',
    },
  })(nothing);
