import {html} from 'lit';
import type {FunctionalComponentWithChildrenNoProps} from '@/src/utils/functional-component-utils';

export const renderSortContainer: FunctionalComponentWithChildrenNoProps =
  () => (children) => {
    return html`
      <div class="text-on-background flex flex-wrap items-center">
        ${children}
      </div>
    `;
  };
