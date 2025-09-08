import {html, type nothing, type TemplateResult} from 'lit';
import type {RefOrCallback} from 'lit/directives/ref.js';
import type {FunctionalComponent} from '../../utils/functional-component-utils';
import './atomic-icon/atomic-icon';
import {when} from 'lit/directives/when.js';
import {type ButtonProps, renderButton} from './button';

export interface IconButtonProps extends ButtonProps {
  badge?: TemplateResult | typeof nothing;
  buttonRef?: RefOrCallback;
  icon: string;
  partPrefix: string;
}

export const renderIconButton: FunctionalComponent<IconButtonProps> = ({
  props,
}) => {
  return html`
    <div class="relative" part="${props.partPrefix}-container">
      ${renderButton({
        props: {
          ...props,
          class: props.class
            ? `relative h-[2.6rem] w-[2.6rem] p-3 ${props.class}`
            : 'relative h-[2.6rem] w-[2.6rem] p-3',
          part: `${props.partPrefix}-button`,
          ref: props.buttonRef,
        },
      })(html`
        <atomic-icon
          icon=${props.icon}
          class="h-4 w-4 shrink-0"
          part="${props.partPrefix}-icon"
        ></atomic-icon>
      `)}
      ${when(
        props.badge,
        () =>
          html`
            <span
              part="${props.partPrefix}-badge"
              class="bg-primary text-on-primary absolute -top-2 -right-2 block h-4 w-4 rounded-full text-center text-xs leading-4"
            >
              ${props.badge}
            </span>
          `
      )}
    </div>
  `;
};
