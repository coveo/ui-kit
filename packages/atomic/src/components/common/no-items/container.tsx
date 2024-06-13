import {FunctionalComponent, h} from '@stencil/core';
import _ from 'lodash';

export const NoItemsContainer: FunctionalComponent = (_, children) => [
  <div class="flex flex-col items-center h-full w-full text-on-background">
    {children}
  </div>,
  <slot></slot>,
];
