import {FunctionalComponent, Host, h} from '@stencil/core';

/**
 * @deprecated This component is no longer needed. For Lit components, render `nothing` instead.
 */
export const Hidden: FunctionalComponent = () => (
  <Host class="atomic-hidden"></Host>
);
