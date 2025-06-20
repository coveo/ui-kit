import {FunctionalComponent} from '@/src/utils/functional-component-utils';
import {i18n} from 'i18next';
import {html, nothing} from 'lit';
import {RefOrCallback} from 'lit/directives/ref.js';
import {renderButton} from '../button';

interface RefineToggleButtonProps {
  i18n: i18n;
  onClick: () => void;
  setRef: RefOrCallback;
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
      ref: props.setRef,
      part: 'button',
    },
  })(nothing)}`;
};
