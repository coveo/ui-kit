import {FunctionalComponent, h} from '@stencil/core';

export const RefineModalBody: FunctionalComponent = (_, children) => {
  return (
    <aside
      part="content"
      slot="body"
      class="flex flex-col w-full"
    >
      {children}
    </aside>
  );
};
