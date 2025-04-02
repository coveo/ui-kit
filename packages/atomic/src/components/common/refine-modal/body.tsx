import {FunctionalComponent, h} from '@stencil/core';

export const RefineModalBody: FunctionalComponent = (_, children) => {
  return (
    <aside
      part="content"
      slot="body"
      class="adjust-for-scroll-bar flex w-full flex-col"
    >
      {children}
    </aside>
  );
};
