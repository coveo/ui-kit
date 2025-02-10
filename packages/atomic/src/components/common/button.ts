import {html} from 'lit-html';
import {ifDefined} from 'lit-html/directives/if-defined.js';
import {createRipple} from '../../utils/ripple';
import {
  getRippleColorForButtonStyle,
  getClassNameForButtonStyle,
  ButtonStyle,
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
}

export const button = <T>({
  props,
  children,
}: {
  props: ButtonProps;
  children: T;
}) => {
  const rippleColor = getRippleColorForButtonStyle(props.style);
  const className = getClassNameForButtonStyle(props.style);

  return html` <button
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
  >
    {props.text ? <span class="truncate">${props.text}</span> : null}
    ${children}
  </button>`;
};
