import {FunctionalComponent, h} from '@stencil/core';
import {JSXBase} from '@stencil/core/internal';
import {createRipple} from '../../utils/ripple-utils';
import {RadioButtonProps} from './radio-button';
import {
  getClassNameForButtonStyle,
  getRippleColorForButtonStyle,
} from './stencil-button-style';

/**
 * @deprecated should only be used for Stencil components.
 */
export interface StencilRadioButtonProps extends Omit<RadioButtonProps, 'ref'> {
  ref?(element?: HTMLInputElement): void;
}

/**
 * @deprecated should only be used for Stencil components.
 */
export const RadioButton: FunctionalComponent<StencilRadioButtonProps> = (
  props
) => {
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

  const handleKeyDown = (event: KeyboardEvent) => {
    if (props.selectWhenFocused !== false) {
      return;
    }
    const {key} = event;
    const radioGroup = (event.currentTarget as HTMLElement).parentNode;

    if (!radioGroup || !isArrowKey(key)) {
      return;
    }

    event.preventDefault();

    const buttons = getRadioButtons(radioGroup);
    const currentIndex = getCurrentIndex(
      buttons,
      event.currentTarget as HTMLInputElement
    );
    const newIndex = getNewIndex(key, currentIndex, buttons.length);

    if (buttons[newIndex]) {
      buttons[newIndex].focus();
    }
  };

  const isArrowKey = (key: string) => {
    return ['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp'].includes(key);
  };

  const getRadioButtons = (radioGroup: ParentNode) => {
    return Array.from(
      radioGroup.querySelectorAll('[type="radio"]')
    ) as HTMLInputElement[];
  };

  const getCurrentIndex = (
    buttons: HTMLInputElement[],
    currentButton: HTMLInputElement
  ) => {
    return buttons.findIndex((button) => button === currentButton);
  };

  const getNewIndex = (key: string, currentIndex: number, length: number) => {
    switch (key) {
      case 'ArrowLeft':
      case 'ArrowUp':
        return (currentIndex - 1 + length) % length;
      case 'ArrowRight':
      case 'ArrowDown':
        return (currentIndex + 1) % length;
      default:
        return currentIndex;
    }
  };

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
      onKeyDown={handleKeyDown}
      type="radio"
      onChange={(e) =>
        (e.currentTarget as HTMLInputElement).checked && props.onChecked?.()
      }
      onMouseDown={onMouseDown}
      {...attributes}
    />
  );
};
