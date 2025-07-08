import type {FunctionalComponentWithChildren} from '@/src/utils/functional-component-utils';
import {html} from 'lit';

export const renderCategoryFacetTreeValueContainer: FunctionalComponentWithChildren<
  Record<string, never>
> = () => (children) => {
  return html`<li class="contents">${children}</li>`;
};
