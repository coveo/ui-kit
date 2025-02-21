import {FunctionalComponent} from '@/src/utils/functional-component-utils';
import {html} from 'lit';
import {classMap} from 'lit/directives/class-map.js';
import {ifDefined} from 'lit/directives/if-defined.js';
import {ref, RefOrCallback} from 'lit/directives/ref.js';
import Tick from '../../images/checkbox.svg';

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

export const checkbox: FunctionalComponent<CheckboxProps> = ({props}) => {
  const partName = props.part ?? 'checkbox';
  const baseClassNames =
    'w-4 h-4 grid place-items-center rounded no-outline hover:border-primary-light focus-visible:border-primary-light';
  const selectedClassNames =
    'selected bg-primary hover:bg-primary-light focus-visible:bg-primary-light';
  const unSelectedClassNames = 'border border-neutral-dark';

  const classNames = {
    [baseClassNames]: true,
    [selectedClassNames]: Boolean(props.checked),
    [unSelectedClassNames]: !props.checked,
    [props.class ?? '']: Boolean(props.class),
  };

  const parts = [partName];
  if (props.checked) {
    parts.push(`${partName}-checked`);
  }

  return html`
    <button
      .key=${props.key}
      id=${ifDefined(props.id)}
      class=${classMap(classNames)}
      part=${parts.join(' ')}
      aria-checked=${ifDefined(props.checked)}
      aria-current=${ifDefined(props.ariaCurrent)}
      aria-label=${ifDefined(props.ariaLabel ?? props.text)}
      value=${ifDefined(props.text)}
      role="checkbox"
      @click=${() => props.onToggle?.(!props.checked)}
      @mousedown=${(e: MouseEvent) => props.onMouseDown?.(e)}
      ${ref(props.ref)}
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
