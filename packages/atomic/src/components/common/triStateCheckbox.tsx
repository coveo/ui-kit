import {FacetValueState} from '@coveo/headless';
import {FunctionalComponent, h} from '@stencil/core';
import Tick from '../../images/checkbox.svg';
import {CheckboxProps} from './checkbox';

export type TriStateCheckboxProps = Omit<CheckboxProps, 'checked'> & {
  state: FacetValueState;
};

export const TriStateCheckbox: FunctionalComponent<TriStateCheckboxProps> = (
  props
) => {
  const isChecked = props.state === 'selected';
  const isExcluded = props.state === 'excluded';
  const partName = props.part ?? 'checkbox';

  const classNames = [
    'w-4 h-4 grid place-items-center rounded no-outline hover:border-primary-light focus-visible:border-primary-light',
  ];
  const parts = [partName];
  if (isChecked) {
    classNames.push(
      'selected bg-primary hover:bg-primary-light focus-visible:bg-primary-light'
    );
    parts.push(`${partName}-checked`);
  } else if (props.state === 'excluded') {
    classNames.push('TODO:');
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
    'aria-pressed': isChecked ? 'true' : isExcluded ? 'mixed' : 'false',
    'aria-label': props.ariaLabel ?? props.text,
    value: props.text,
    ref: props.ref,
  };

  return (
    <button
      {...attributes}
      role="checkbox"
      onClick={() => props.onToggle?.(!isChecked)}
      onMouseDown={(e) => props.onMouseDown?.(e)}
    >
      <atomic-icon
        style={{stroke: 'white'}}
        class={`w-3/5 ${isChecked ? 'block' : isExcluded ? 'TODO:' : 'hidden'}`}
        icon={Tick}
        part={props.iconPart}
      ></atomic-icon>
    </button>
  );
};
