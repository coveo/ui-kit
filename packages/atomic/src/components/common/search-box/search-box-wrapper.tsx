import {FunctionalComponent, h} from '@stencil/core';

interface Props {
  disabled: boolean;
}

export const SearchBoxWrapper: FunctionalComponent<Props> = (
  props,
  children
) => (
  <div
    part="wrapper"
    class={`relative flex bg-background h-full w-full border border-neutral rounded-md focus-within:ring ${
      props.disabled
        ? 'focus-within:border-disabled focus-within:ring-neutral'
        : 'focus-within:border-primary focus-within:ring-ring-primary'
    }`}
  >
    {children}
  </div>
);
