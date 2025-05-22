import {multiClassMap, tw} from '@/src/directives/multi-class-map';
import {FunctionalComponentWithChildren} from '@/src/utils/functional-component-utils';
import {html} from 'lit';

interface Props {
  disabled: boolean;
  onFocusout?: (event: FocusEvent) => void;
}

export const renderSearchBoxWrapper: FunctionalComponentWithChildren<Props> =
  ({props}) =>
  (children) => {
    const classes = tw({
      'bg-background border-neutral absolute top-0 left-0 flex w-full rounded-md border focus-within:ring-3':
        true,
      'focus-within:border-disabled focus-within:ring-neutral': props.disabled,
      'focus-within:border-primary focus-within:ring-ring-primary':
        !props.disabled,
    });

    return html`<div
      part="wrapper"
      class=${multiClassMap(classes)}
      @focusout=${props.onFocusout}
    >
      ${children}
    </div>`;
  };
