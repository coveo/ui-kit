import {html} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import {type RefOrCallback, ref} from 'lit/directives/ref.js';
import {multiClassMap, tw} from '@/src/directives/multi-class-map';
import type {FunctionalComponent} from '@/src/utils/functional-component-utils';
import Tick from '../../images/checkbox.svg';
import './atomic-icon/atomic-icon';

export interface CheckboxProps {
  checked?: boolean;
  onToggle(checked: boolean): void;
  key?: string | number;
  id?: string;
  class?: string;
  text?: string;
  part?: string;
  iconPart?: string;
  ariaLabel?: string;
  ariaCurrent?:
    | 'page'
    | 'step'
    | 'location'
    | 'date'
    | 'time'
    | 'true'
    | 'false';
  ref?: RefOrCallback;
  onMouseDown?(evt: MouseEvent): void;
}

export const renderCheckbox: FunctionalComponent<CheckboxProps> = ({props}) => {
  const partName = props.part ?? 'checkbox';

  const classNames = tw({
    'no-outline hover:border-primary-light focus-visible:border-primary-light grid h-4 w-4 place-items-center rounded': true,
    'selected bg-primary hover:bg-primary-light focus-visible:bg-primary-light':
      Boolean(props.checked),
    'border-neutral-dark border': !props.checked,
    [props.class ?? '']: Boolean(props.class),
  });

  const parts = [partName];
  if (props.checked) {
    parts.push(`${partName}-checked`);
  }

  return html`
    <button
      .key=${props.key}
      id=${ifDefined(props.id)}
      class=${multiClassMap(classNames)}
      part=${parts.join(' ')}
      aria-checked=${ifDefined(props.checked)}
      aria-current=${ifDefined(props.ariaCurrent)}
      aria-label=${ifDefined(props.ariaLabel ?? props.text)}
      value=${ifDefined(props.text)}
      role="checkbox"
      @click=${() => props.onToggle?.(!props.checked)}
      @mousedown=${(e: MouseEvent) => props.onMouseDown?.(e)}
      ${props.ref ? ref(props.ref) : ''}
    >
      <atomic-icon
        style="stroke: white"
        class="${props.checked ? 'block' : 'hidden'} w-3/5"
        .icon=${Tick}
        part=${ifDefined(props.iconPart)}
      ></atomic-icon>
    </button>
  `;
};
