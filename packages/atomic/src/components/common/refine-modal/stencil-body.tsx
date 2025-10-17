import {FunctionalComponent, h} from '@stencil/core';

/**
 * @deprecated should only be used for Stencil components.
 */
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
