import {FacetValueState} from '@coveo/headless';
import {FunctionalComponent, h} from '@stencil/core';
import Tick from '../../images/checkbox.svg';
import Close from '../../images/close.svg';
import {CheckboxProps} from './checkbox';

export type TriStateCheckboxProps = Omit<CheckboxProps, 'checked'> & {
  state: FacetValueState;
};

export const TriStateCheckbox: FunctionalComponent<TriStateCheckboxProps> = (
  props
) => {
  const isSelected = props.state === 'selected';
  const isExcluded = props.state === 'excluded';
  const partName = props.part ?? 'checkbox';

  const classNames = ['w-4 h-4 grid place-items-center rounded no-outline '];
  const parts = [partName];
  if (isSelected) {
    classNames.push(
      'selected bg-primary hover:bg-primary-light focus-visible:bg-primary-light hover:border-primary-light focus-visible:border-primary-light'
    );
    parts.push(`${partName}-checked`);
  } else if (isExcluded) {
    classNames.push(
      'excluded bg-error hover:bg-error-light focus-visible:bg-error-light hover:border-error-light focus-visible:border-error-light'
    );
    parts.push(`${partName}-excluded`);
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
    'aria-pressed': isSelected ? 'true' : isExcluded ? 'mixed' : 'false',
    'aria-label': props.ariaLabel ?? props.text,
    value: props.text,
    ref: props.ref,
  };

  return (
    <button
      {...attributes}
      role="checkbox"
      onClick={() => props.onToggle?.(!isSelected)}
      onMouseDown={(e) => props.onMouseDown?.(e)}
    >
      <atomic-icon
        style={{stroke: 'white', fill: 'white'}}
        class={`w-3/5 ${isSelected || isExcluded ? 'block' : 'hidden'}`}
        icon={isSelected ? Tick : Close}
        part={props.iconPart}
      ></atomic-icon>
    </button>
  );
};
