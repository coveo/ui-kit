import {FunctionalComponentWithChildren} from '@/src/utils/functional-component-utils';
import {html} from 'lit';
import {classMap} from 'lit/directives/class-map.js';

interface Props {
  disabled: boolean;
  onFocusout?: (event: FocusEvent) => void;
}

export const wrapper: FunctionalComponentWithChildren<Props> =
  ({props}) =>
  (children) => {
    const classes = {
      'flex bg-background w-full border border-neutral rounded-md focus-within:ring-3 absolute top-0 left-0':
        true,
      'focus-within:border-disabled focus-within:ring-neutral': props.disabled,
      'focus-within:border-primary focus-within:ring-ring-primary':
        !props.disabled,
    };

    return html`<div
      part="wrapper"
      class=${classMap(classes)}
      @focusout=${props.onFocusout}
    >
      ${children}
    </div>`;
  };
