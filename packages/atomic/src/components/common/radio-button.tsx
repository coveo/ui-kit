import {FunctionalComponent, h} from '@stencil/core';
import {createRipple} from '../../utils/ripple';
import {
  ButtonStyle,
  getClassNameForButtonStyle,
  getRippleColorForButtonStyle,
} from './button-style';

export interface RadioButtonProps {
  style: ButtonStyle;
  groupName: string;
  onChecked?(): void;
  key?: string | number;
  checked?: boolean;
  class?: string;
  text?: string;
  part?: string;
  ariaLabel?: string;
  ariaCurrent?: string;
  ref?(element?: HTMLInputElement): void;
}

export const RadioButton: FunctionalComponent<RadioButtonProps> = (props) => {
  const rippleColor = getRippleColorForButtonStyle(props.style);
  const classNames = ['btn-radio', getClassNameForButtonStyle(props.style)];
  if (props.checked) {
    classNames.push('selected');
  }
  if (props.class) {
    classNames.push(props.class);
  }

  const attributes = {
    name: props.groupName,
    key: props.key,
    checked: props.checked,
    class: classNames.join(' '),
    part: props.part,
    'aria-label': props.ariaLabel,
    'aria-current': props.ariaCurrent,
    value: props.text,
    ref: props.ref,
  };

  return (
    <input
      {...attributes}
      type="radio"
      onChange={(e) =>
        (e.currentTarget as HTMLInputElement).checked && props.onChecked?.()
      }
      onMouseDown={(e) => createRipple(e, {color: rippleColor})}
    />
  );
};
