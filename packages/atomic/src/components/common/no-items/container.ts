import {FunctionalComponentWithChildrenNoProps} from '@/src/utils/functional-component-utils';
import {html} from 'lit';

export const renderNoItemsContainer: FunctionalComponentWithChildrenNoProps =
  () => (children) =>
    html`
    <div class="text-on-background flex h-full w-full flex-col items-center">
      ${children}
    </div>
    <slot></slot>
  `;
