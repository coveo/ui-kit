import {FunctionalComponent, h} from '@stencil/core';

/**
 * @deprecated Should only be used for Stencil components; for Lit components, use the facet-container.ts file instead
 */
export const FacetContainer: FunctionalComponent = (_, children) => (
  <div class="bg-background border-neutral rounded-lg border p-4" part="facet">
    {children}
  </div>
);
