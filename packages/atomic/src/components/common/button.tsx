import {FunctionalComponent, h} from '@stencil/core';
import {createRipple} from '../../utils/ripple';

interface ButtonProps {
  style:
    | 'primary'
    | 'outline-primary'
    | 'outline-neutral'
    | 'outline-bg-neutral'
    | 'text-primary'
    | 'text-neutral'
    | 'text-transparent';
  onClick?(): void;
  class?: string;
  text?: string;
  part?: string;
  type?: string;
  role?: string;
  disabled?: boolean;
  ariaLabel?: string;
  ariaExpanded?: string;
  ariaPressed?: string;
  ariaChecked?: string;
  ariaCurrent?: string;
  title?: string;
  ref?(element?: HTMLButtonElement): void;
}

export const Button: FunctionalComponent<ButtonProps> = (props, children) => {
  let rippleColor: string;
  let className: string;
  switch (props.style) {
    case 'primary':
      className = 'btn-primary';
      rippleColor = 'primary';
      break;
    case 'outline-primary':
      className = 'btn-outline-primary';
      rippleColor = 'neutral';
      break;
    case 'outline-neutral':
      className = 'btn-outline-neutral';
      rippleColor = 'neutral';
      break;
    case 'outline-bg-neutral':
      className = 'btn-outline-bg-neutral';
      rippleColor = 'neutral';
      break;
    case 'text-primary':
      className = 'btn-text-primary';
      rippleColor = 'neutral';
      break;
    case 'text-neutral':
      className = 'btn-text-neutral';
      rippleColor = 'neutral';
      break;
    case 'text-transparent':
      className = 'btn-text-transparent';
      rippleColor = 'neutral-light';
      break;
  }

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
    disabled: props.disabled,
    ref: props.ref,
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
