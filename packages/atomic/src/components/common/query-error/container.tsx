import {FunctionalComponent, h} from '@stencil/core';

export const QueryErrorContainer: FunctionalComponent = (_, children) => {
  return <div class="text-center p-8">{children}</div>;
};
