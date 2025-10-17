import {FunctionalComponent, h} from '@stencil/core';

/**
 * @deprecated should only be used for Stencil components.
 */
export const QueryErrorContainer: FunctionalComponent = (_, children) => {
  return <div class="p-8 text-center">{children}</div>;
};
