import {FunctionalComponent, h} from '@stencil/core';

/**
 * @deprecated should only be used for Stencil components.
 */
export const RefineModalBody: FunctionalComponent<{
  ariaLabel: string;
}> = ({ariaLabel}, children) => {
  return (
    <aside
      part="content"
      slot="body"
      class="adjust-for-scroll-bar flex w-full flex-col"
      aria-label={ariaLabel}
    >
      {children}
    </aside>
  );
};
