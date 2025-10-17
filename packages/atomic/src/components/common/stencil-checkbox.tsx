import {FunctionalComponent, h} from '@stencil/core';
import Tick from '../../images/checkbox.svg';

/**
 * @deprecated should only be used for Stencil components.
 */
export interface StencilCheckboxProps {
  checked: boolean;
  onToggle(checked: boolean): void;
  key?: string | number;
  id?: string;
  class?: string;
  text?: string;
  part?: string;
  iconPart?: string;
  ariaLabel?: string;
  ariaCurrent?: string;
  ref?(element?: HTMLElement): void;
  onMouseDown?(evt: MouseEvent): void;
}

/**
 * @deprecated should only be used for Stencil components.
 */
export const StencilCheckbox: FunctionalComponent<StencilCheckboxProps> = (
  props
) => {
  const partName = props.part ?? 'checkbox';

  const classNames = [
    'w-4 h-4 grid place-items-center rounded focus-visible:outline-none hover:border-primary-light focus-visible:border-primary-light',
  ];
  const parts = [partName];
  if (props.checked) {
    classNames.push(
      'selected bg-primary hover:bg-primary-light focus-visible:bg-primary-light'
    );
    parts.push(`${partName}-checked`);
  } else {
    classNames.push('border border-neutral-dark');
  }
  if (props.class) {
    classNames.push(props.class);
  }

  const attributes = {
    key: props.key,
    id: props.id,
    class: classNames.join(' '),
    part: parts.join(' '),
    'aria-checked': props.checked.toString(),
    'aria-label': props.ariaLabel ?? props.text,
    value: props.text,
    ref: props.ref,
  };

  return (
    <button
      {...attributes}
      role="checkbox"
      onClick={() => props.onToggle?.(!props.checked)}
      onMouseDown={(e) => props.onMouseDown?.(e)}
    >
      <atomic-icon
        style={{stroke: 'white'}}
        class={`w-3/5 ${props.checked ? 'block' : 'hidden'}`}
        icon={Tick}
        part={props.iconPart}
      ></atomic-icon>
    </button>
  );
};
