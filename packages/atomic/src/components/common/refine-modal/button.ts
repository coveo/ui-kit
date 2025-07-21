import type {i18n} from 'i18next';
import {html, nothing} from 'lit';
import type {RefOrCallback} from 'lit/directives/ref.js';
import type {FunctionalComponent} from '@/src/utils/functional-component-utils';
import {renderButton} from '../button';

interface RefineToggleButtonProps {
  i18n: i18n;
  onClick: () => void;
  refCallback: RefOrCallback;
}

export const renderRefineToggleButton: FunctionalComponent<
  RefineToggleButtonProps
> = ({props}) => {
  return html`${renderButton({
    props: {
      style: 'outline-primary',
      class: 'w-full p-3',
      onClick: props.onClick,
      text: props.i18n.t('sort-and-filter'),
      ref: props.refCallback,
      part: 'button',
    },
  })(nothing)}`;
};
