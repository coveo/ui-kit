import type {i18n} from 'i18next';
import {renderButton} from '@/src/components/common/button.js';
import type {FunctionalComponent} from '@/src/utils/functional-component-utils';

export interface CancelButtonProps {
  i18n: i18n;
  onClick: () => void;
}

import {nothing} from 'lit';

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
  })(nothing);
