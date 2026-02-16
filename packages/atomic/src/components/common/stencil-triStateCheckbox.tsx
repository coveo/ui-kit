import {FacetValueState} from '@coveo/headless';
import {FunctionalComponent, h} from '@stencil/core';
import Tick from '../../images/checkbox.svg';
import Close from '../../images/close.svg';
import {StencilCheckboxProps} from './stencil-checkbox';

type TriStateCheckboxProps = Omit<StencilCheckboxProps, 'checked'> & {
  state: FacetValueState;
};

/**
 * @deprecated should only be used for Stencil components.
 */
export const TriStateCheckbox: FunctionalComponent<TriStateCheckboxProps> = (
  props
) => {
  const isSelected = props.state === 'selected';
  const isExcluded = props.state === 'excluded';
  const partName = props.part ?? 'checkbox';

  const classNames = [
    'w-4 h-4 grid place-items-center rounded focus-visible:outline-none hover:border-primary-light focus-visible:border-primary-light',
  ];
  const parts = [partName];
  if (isSelected) {
    classNames.push(
      'selected bg-primary hover:bg-primary-light focus-visible:bg-primary-light'
    );
    parts.push(`${partName}-checked`);
  } else if (isExcluded) {
    classNames.push(
      'excluded bg-error hover:bg-error focus-visible:bg-error hover:border-error focus-visible:border-error'
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
    'aria-pressed': isSelected ? 'true' : isExcluded ? 'mixed' : 'false',
    'aria-label': props.ariaLabel ?? props.text,
    value: props.text,
    ref: props.ref,
  };

  return (
    <button
      {...attributes}
      role="button"
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
