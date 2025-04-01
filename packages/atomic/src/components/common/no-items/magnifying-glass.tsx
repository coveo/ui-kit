import {FunctionalComponent, h} from '@stencil/core';
import MagnifyingGlassIcon from '../../../images/magnifying-glass.svg';

export const MagnifyingGlass: FunctionalComponent = () => (
  <atomic-icon
    part="icon"
    icon={MagnifyingGlassIcon}
    class="my-6 flex w-1/2 max-w-lg flex-col items-center"
  ></atomic-icon>
);
