import {FunctionalComponent, h} from '@stencil/core';
import {createRipple} from '../../utils/ripple';
import {
  ButtonStyle,
  getRippleColorForButtonStyle,
  getClassNameForButtonStyle,
} from './button-style';

export interface ButtonProps {
  style: ButtonStyle;
  onClick?(): void;
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
  title?: string;
  ref?(element?: HTMLButtonElement): void;
}

export const Button: FunctionalComponent<ButtonProps> = (props, children) => {
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
    disabled: props.disabled,
    ref(buttonEl?: HTMLButtonElement) {
      if (props.form) {
        buttonEl?.setAttribute('form', props.form);
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
