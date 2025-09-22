import {html, nothing} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import {type RefOrCallback, ref} from 'lit/directives/ref.js';
import {when} from 'lit/directives/when.js';
import type {FunctionalComponentWithChildren} from '@/src/utils/functional-component-utils';
import {createRipple} from '../../utils/ripple-utils';
import {
  type ButtonStyle,
  getClassNameForButtonStyle,
  getRippleColorForButtonStyle,
} from './button-style';

export interface ButtonProps {
  style: ButtonStyle;
  onClick?(event?: MouseEvent): void;
  class?: string;
  text?: string;
  part?: string;
  type?: 'button' | 'submit' | 'reset' | 'menu';
  form?: string;
  role?:
    | 'status'
    | 'application'
    | 'checkbox'
    | 'button'
    | 'dialog'
    | 'img'
    | 'radiogroup'
    | 'toolbar'
    | 'listitem'
    | 'list'
    | 'separator';
  disabled?: boolean;
  ariaLabel?: string;
  ariaExpanded?: 'true' | 'false';
  ariaPressed?: 'true' | 'false' | 'mixed';
  ariaChecked?: 'true' | 'false' | 'mixed';
  ariaCurrent?: 'page' | 'false';
  ariaControls?: string;
  ariaHidden?: 'true' | 'false';
  tabIndex?: number;
  title?: string;
  ref?: RefOrCallback;
}

export const renderButton: FunctionalComponentWithChildren<ButtonProps> =
  ({props}) =>
  (children) => {
    const rippleColor = getRippleColorForButtonStyle(props.style);
    const className = getClassNameForButtonStyle(props.style);

    return html`<button
      type=${ifDefined(props.type)}
      title=${ifDefined(props.title)}
      tabindex=${ifDefined(props.tabIndex)}
      role=${ifDefined(props.role)}
      part=${ifDefined(props.part)}
      form=${ifDefined(props.form)}
      class=${props.class ? `${className} ${props.class}` : className}
      aria-pressed=${ifDefined(props.ariaPressed)}
      aria-label=${ifDefined(props.ariaLabel)}
      aria-hidden=${ifDefined(props.ariaHidden)}
      aria-expanded=${ifDefined(props.ariaExpanded)}
      aria-current=${ifDefined(props.ariaCurrent)}
      aria-controls=${ifDefined(props.ariaControls)}
      aria-checked=${ifDefined(props.ariaChecked)}
      @mousedown=${(e: MouseEvent) => createRipple(e, {color: rippleColor})}
      @click=${props.onClick}
      ?disabled=${props.disabled}
      ${props.ref ? ref(props.ref) : nothing}
    >
      ${when(
        props.text,
        () => html`<span class="truncate">${props.text}</span>`
      )}
      ${children}
    </button>`;
  };
