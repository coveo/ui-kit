import {FunctionalComponent, h} from '@stencil/core';
import MagnifyingGlassIcon from '../../../images/magnifying-glass.svg';

/**
 * @deprecated should only be used for Stencil components.
 */
export const MagnifyingGlass: FunctionalComponent = () => (
  <atomic-icon
    part="icon"
    icon={MagnifyingGlassIcon}
    class="my-6 flex w-1/2 max-w-lg flex-col items-center"
  ></atomic-icon>
);
