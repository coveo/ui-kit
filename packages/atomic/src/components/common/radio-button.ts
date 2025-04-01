import {FunctionalComponent} from '@/src/utils/functional-component-utils';
import {html} from 'lit';
import {classMap} from 'lit/directives/class-map.js';
import {ifDefined} from 'lit/directives/if-defined.js';
import {ref, RefOrCallback} from 'lit/directives/ref.js';
import {createRipple} from '../../utils/ripple';
import {
  ButtonStyle,
  getClassNameForButtonStyle,
  getRippleColorForButtonStyle,
} from './button-style';

export interface RadioButtonProps {
  groupName: string;
  selectWhenFocused?: boolean;
  onChecked?(): void;
  style?: ButtonStyle;
  key?: string | number;
  checked?: boolean;
  class?: string;
  text?: string;
  part?: string;
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
}

export const radioButton: FunctionalComponent<RadioButtonProps> = ({props}) => {
  const classNames = {
    'btn-radio': true,
    selected: Boolean(props.checked),
    ...(props.class && {[props.class]: true}),
    ...(props.style && {[getClassNameForButtonStyle(props.style)]: true}),
  };

  const onMouseDown = (e: MouseEvent) => {
    if (props.style) {
      const rippleColor = getRippleColorForButtonStyle(props.style);
      createRipple(e, {color: rippleColor});
    }
  };

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

  const onChange = (e: Event) => {
    const input = e.currentTarget as HTMLInputElement;
    if (input.checked && props.onChecked) {
      props.onChecked();
    }
  };

  return html`
    <input
      type="radio"
      name=${props.groupName}
      class=${classMap(classNames)}
      value=${ifDefined(props.text)}
      part=${ifDefined(props.part)}
      aria-label=${ifDefined(props.ariaLabel ?? props.text)}
      aria-current=${ifDefined(props.ariaCurrent)}
      ?checked=${Boolean(props.checked)}
      .key=${props.key}
      @change=${onChange}
      @keydown=${handleKeyDown}
      @mousedown=${onMouseDown}
      ${ref(props.ref)}
    />
  `;
};
