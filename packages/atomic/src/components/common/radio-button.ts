import {html, nothing} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import {type RefOrCallback, ref} from 'lit/directives/ref.js';
import {multiClassMap} from '@/src/directives/multi-class-map';
import type {FunctionalComponent} from '@/src/utils/functional-component-utils';
import {createRipple} from '../../utils/ripple-utils';
import {
  type ButtonStyle,
  getClassNameForButtonStyle,
  getRippleColorForButtonStyle,
} from './button-style';

export interface RadioButtonProps {
  groupName: string;
  selectWhenFocused?: boolean;
  onChecked?(): void;
  onFocus?(): void;
  style?: ButtonStyle;
  key?: string | number;
  checked?: boolean;
  class?: string;
  text?: string;
  part?: string;
  ariaLabel?: string;
  ariaRoleDescription?: string;
  ariaCurrent?:
    | 'page'
    | 'step'
    | 'location'
    | 'date'
    | 'time'
    | 'true'
    | 'false';
  ref?: RefOrCallback;
  onFocusCallback?: (
    elements: HTMLInputElement[],
    previousFocus: HTMLInputElement,
    newFocus: HTMLInputElement
  ) => Promise<void>;
}

export const renderRadioButton: FunctionalComponent<RadioButtonProps> = ({
  props,
}) => {
  const classNames = {
    'btn-radio': true,
    selected: Boolean(props.checked),
    ...(props.class && {[props.class]: true}),
    ...(props.style && {[getClassNameForButtonStyle(props.style)]: true}),
  };

  const onMouseDown = async (e: MouseEvent) => {
    if (props.style) {
      const rippleColor = getRippleColorForButtonStyle(props.style);
      await createRipple(e, {color: rippleColor});
    }
  };

  const handleKeyDown = async (event: KeyboardEvent) => {
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

    const newIndex = getNewIndex(
      key,
      currentIndex,
      buttons.length,
      event.shiftKey
    );

    if (buttons[newIndex]) {
      if (props.onFocusCallback) {
        await props.onFocusCallback(
          buttons,
          buttons[currentIndex],
          buttons[newIndex]
        );
      } else {
        buttons[newIndex].focus();
      }
    }
  };

  const isArrowKey = (key: string) => {
    return ['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp', 'Tab'].includes(
      key
    );
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

  const getNewIndex = (
    key: string,
    currentIndex: number,
    length: number,
    isShiftPressed: boolean
  ) => {
    switch (key) {
      case 'ArrowLeft':
      case 'ArrowUp':
        return (currentIndex - 1 + length) % length;
      case 'ArrowRight':
      case 'ArrowDown':
        return (currentIndex + 1) % length;
      case 'Tab':
        if (isShiftPressed) {
          return (currentIndex - 1 + length) % length;
        } else {
          return (currentIndex + 1) % length;
        }
      default:
        return currentIndex;
    }
  };

  const onChange = (e: Event) => {
    const input = e.currentTarget as HTMLInputElement;
    if (input.checked && props.onChecked) {
      props.onChecked();
    }
  };

  const radioButtonRef = props.ref ? ref(props.ref) : nothing;

  return html`
    <input
      type="radio"
      name=${props.groupName}
      class=${multiClassMap(classNames)}
      value=${ifDefined(props.text)}
      part=${ifDefined(props.part)}
      aria-label=${ifDefined(props.ariaLabel ?? props.text)}
      aria-current=${ifDefined(props.ariaCurrent)}
      aria-roledescription=${ifDefined(props.ariaRoleDescription)}
      ?checked=${Boolean(props.checked)}
      .key=${props.key}
      @focus=${props.onFocus}
      @change=${onChange}
      @keydown=${handleKeyDown}
      @mousedown=${onMouseDown}
      ${radioButtonRef}
    />
  `;
};
