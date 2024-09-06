import {FunctionalComponent, h} from '@stencil/core';

export const QueryErrorContainer: FunctionalComponent = (_, children) => {
  return <div class="p-8 text-center">{children}</div>;
};
