import {FunctionalComponent, h} from '@stencil/core';
import {createRipple} from '../../utils/ripple-utils';
import {
  ButtonStyle,
  getRippleColorForButtonStyle,
  getClassNameForButtonStyle,
} from './stencil-button-style';

/**
 * @deprecated should only be used for Stencil components.
 */
export interface StencilButtonProps {
  style: ButtonStyle;
  onClick?(event?: MouseEvent): void;
  class?: string;
  text?: string;
  part?: string;
  type?: string;
  form?: string;
  role?: string;
  disabled?: boolean;
  ariaLabel?: string;
  ariaExpanded?: string;
  ariaPressed?: string;
  ariaChecked?: string;
  ariaCurrent?: string;
  ariaControls?: string;
  ariaHidden?: string;
  tabIndex?: string;
  title?: string;
  ref?(element?: HTMLButtonElement): void;
}

/**
 * @deprecated should only be used for Stencil components.
 */
export const Button: FunctionalComponent<StencilButtonProps> = (
  props,
  children
) => {
  const rippleColor = getRippleColorForButtonStyle(props.style);
  const className = getClassNameForButtonStyle(props.style);

  const attributes = {
    class: props.class ? `${className} ${props.class}` : className,
    part: props.part,
    onClick: props.onClick,
    title: props.title,
    type: props.type,
    role: props.role,
    'aria-label': props.ariaLabel,
    'aria-expanded': props.ariaExpanded,
    'aria-pressed': props.ariaPressed,
    'aria-checked': props.ariaChecked,
    'aria-current': props.ariaCurrent,
    'aria-controls': props.ariaControls,
    'aria-hidden': props.ariaHidden,
    disabled: props.disabled,
    ref(buttonEl?: HTMLButtonElement) {
      if (props.form) {
        buttonEl?.setAttribute('form', props.form);
      }
      if (props.ariaHidden) {
        buttonEl?.setAttribute('aria-hidden', props.ariaHidden);
      }
      if (props.tabIndex) {
        buttonEl?.setAttribute('tabindex', props.tabIndex);
      }
      props.ref?.(buttonEl);
    },
  };

  return (
    <button
      {...attributes}
      onMouseDown={(e) => createRipple(e, {color: rippleColor})}
    >
      {props.text ? <span class="truncate">{props.text}</span> : null}
      {children}
    </button>
  );
};
