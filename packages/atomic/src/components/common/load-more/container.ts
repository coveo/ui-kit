import {FunctionalComponentWithChildrenNoProps} from '@/src/utils/functional-component-utils';
import {html} from 'lit';

export const renderLoadMoreContainer: FunctionalComponentWithChildrenNoProps =
  () => (children) => {
    return html`
      <div class="flex flex-col items-center" part="container">${children}</div>
    `;
  };
