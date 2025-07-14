import {html} from 'lit';
import type {FunctionalComponentWithChildrenNoProps} from '@/src/utils/functional-component-utils';

export const renderNoItemsContainer: FunctionalComponentWithChildrenNoProps =
  () => (children) =>
    html`
    <div class="text-on-background flex h-full w-full flex-col items-center">
      ${children}
    </div>
    <slot></slot>
  `;
