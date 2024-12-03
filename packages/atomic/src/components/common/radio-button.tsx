import {FunctionalComponent, h} from '@stencil/core';
import {JSXBase} from '@stencil/core/internal';
import {createRipple} from '../../utils/ripple';
import {
  ButtonStyle,
  getClassNameForButtonStyle,
  getRippleColorForButtonStyle,
} from './button-style';

export interface RadioButtonProps {
  groupName: string;
  onKeyDown?(event: KeyboardEvent): void;
  onChecked?(): void;
  style?: ButtonStyle;
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
  const classNames = ['btn-radio'];
  let onMouseDown:
    | JSXBase.DOMAttributes<HTMLInputElement>['onMouseDown']
    | undefined;
  if (props.style) {
    const rippleColor = getRippleColorForButtonStyle(props.style);
    classNames.push(getClassNameForButtonStyle(props.style));

    onMouseDown = (e) => createRipple(e, {color: rippleColor});
  }
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
    'aria-label': props.ariaLabel ?? props.text,
    'aria-current': props.ariaCurrent,
    value: props.text,
    ref: props.ref,
  };

  return (
    <input
      onKeyDown={props.onKeyDown}
      type="radio"
      onChange={(e) =>
        (e.currentTarget as HTMLInputElement).checked && props.onChecked?.()
      }
      onMouseDown={onMouseDown}
      {...attributes}
    />
  );
};
