import {FunctionalComponent, h} from '@stencil/core';

interface Props {
  disabled: boolean;
  textArea?: boolean;
}

export const SearchBoxWrapper: FunctionalComponent<Props> = (
  props,
  children
) => (
  <div
    part="wrapper"
    class={`flex bg-background w-full border border-neutral rounded-md focus-within:ring ${
      props.disabled
        ? 'focus-within:border-disabled focus-within:ring-neutral'
        : 'focus-within:border-primary focus-within:ring-ring-primary'
    } ${props.textArea ? 'absolute top-0 left-0' : 'relative h-full'}`}
  >
    {children}
  </div>
);
