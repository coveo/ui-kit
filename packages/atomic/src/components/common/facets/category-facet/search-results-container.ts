import type {FunctionalComponentWithChildrenNoProps} from '@/src/utils/functional-component-utils';
import {html} from 'lit';

export const renderCategoryFacetSearchResultsContainer: FunctionalComponentWithChildrenNoProps =
  () => (children) => {
    return html`<ul part="search-results" class="mt-3">
      ${children}
    </ul>`;
  };
