import {FunctionalComponent, h} from '@stencil/core';
import MagnifyingGlassIcon from '../../../images/magnifying-glass.svg';

export const MagnifyingGlass: FunctionalComponent = () => (
  <atomic-icon
    part="icon"
    icon={MagnifyingGlassIcon}
    class="my-6 flex flex-col items-center w-1/2 max-w-lg"
  ></atomic-icon>
);
