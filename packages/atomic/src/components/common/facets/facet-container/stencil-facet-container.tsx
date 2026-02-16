import {FunctionalComponent, h} from '@stencil/core';

/**
 * @deprecated should only be used for Stencil components.
 */
export const FacetContainer: FunctionalComponent = (_, children) => (
  <div class="bg-background border-neutral rounded-lg border p-4" part="facet">
    {children}
  </div>
);
