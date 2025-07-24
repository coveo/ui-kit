import type {FunctionalComponentWithChildrenNoProps} from '@/src/utils/functional-component-utils';
import {html} from 'lit';

export const renderCategoryFacetTreeValueContainer: FunctionalComponentWithChildrenNoProps =
  () => (children) => {
    return html`<li class="contents">${children}</li>`;
  };
