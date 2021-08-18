import {FunctionalComponent, h} from '@stencil/core';
import {createRipple} from '../../utils/ripple';

interface ButtonProps {
  style:
    | 'primary'
    | 'outline-primary'
    | 'borderless-outline-primary'
    | 'outline-on-background'
    | 'borderless-outline-on-background';
  onClick?(): void;
  class?: string;
  text?: string;
  part?: string;
  type?: string;
  ariaLabel?: string;
  ariaExpanded?: string;
  ariaPressed?: string;
  title?: string;
  ref?(element?: HTMLButtonElement): void;
}

export const Button: FunctionalComponent<ButtonProps> = (props, children) => {
  let className: string;
  let rippleColor: string;

  switch (props.style) {
    case 'primary':
      className = 'btn-primary';
      rippleColor = 'primary';
      break;
    case 'outline-primary':
      className = 'btn-outline-primary';
      rippleColor = 'neutral';
      break;
    case 'borderless-outline-primary':
      className = 'btn-borderless-outline-primary';
      rippleColor = 'neutral';
      break;
    case 'outline-on-background':
      className = 'btn-outline-on-background';
      rippleColor = 'neutral';
      break;
    case 'borderless-outline-on-background':
      className = 'btn-borderless-outline-on-background';
      rippleColor = 'neutral';
      break;
  }

  const attributes = {
    class: props.class ? `${className} ${props.class}` : className,
    part: props.part,
    onClick: props.onClick,
    title: props.title,
    type: props.type,
    'aria-label': props.ariaLabel,
    'aria-expanded': props.ariaExpanded,
    'aria-pressed': props.ariaPressed,
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
