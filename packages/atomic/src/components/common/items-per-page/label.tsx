import {FunctionalComponent, h} from '@stencil/core';

export const Label: FunctionalComponent = (_, children) => {
  return (
    <span
      part="label"
      class="self-start text-on-background text-lg mr-3 leading-10"
      aria-hidden="true"
    >
      {children}
    </span>
  );
};
