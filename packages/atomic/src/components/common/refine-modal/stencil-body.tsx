import {FunctionalComponent, h} from '@stencil/core';

export const RefineModalBody: FunctionalComponent = (_, children) => {
  return (
    <aside
      part="content"
      slot="body"
      class="mr-[calc(-1*(100vw-3rem-100%))] flex w-full flex-col"
    >
      {children}
    </aside>
  );
};
