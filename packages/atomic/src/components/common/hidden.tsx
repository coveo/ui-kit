import {FunctionalComponent, Host, h} from '@stencil/core';

/**
 * @deprecated use the displayIf directive instead
 */
export const Hidden: FunctionalComponent = () => (
  <Host class="atomic-hidden"></Host>
);
