import {FunctionalComponent, h} from '@stencil/core';

export const Label: FunctionalComponent = (_, children) => {
  return (
    <span
      part="label"
      class="text-on-background mr-3 self-start text-lg leading-10"
      aria-hidden="true"
    >
      {children}
    </span>
  );
};
