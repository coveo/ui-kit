import {html} from 'lit';
import type {FunctionalComponentWithChildrenNoProps} from '@/src/utils/functional-component-utils';

export const renderLoadMoreContainer: FunctionalComponentWithChildrenNoProps =
  () => (children) => {
    return html`
      <div class="flex flex-col items-center" part="container">${children}</div>
    `;
  };
