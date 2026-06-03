import {html} from 'lit';
import type {FunctionalComponentWithChildrenNoProps} from '@/src/utils/functional-component-utils';

export const renderCategoryFacetTreeValueContainer: FunctionalComponentWithChildrenNoProps =
  () => (children) => {
    return html`<li class="contents">${children}</li>`;
  };
