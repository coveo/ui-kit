import {FunctionalComponent, Host, h} from '@stencil/core';

/**
 * @deprecated Should only be used for Stencil components; for Lit components, use the displayIf directive instead
 */
export const Hidden: FunctionalComponent = () => (
  <Host class="atomic-hidden"></Host>
);
