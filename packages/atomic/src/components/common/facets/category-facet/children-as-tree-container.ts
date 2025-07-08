import type {FunctionalComponentWithChildren} from '@/src/utils/functional-component-utils';
import {html} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';

interface CategoryFacetChildrenAsTreeContainerProps {
  className?: string;
}

export const renderCategoryFacetChildrenAsTreeContainer: FunctionalComponentWithChildren<
  CategoryFacetChildrenAsTreeContainerProps
> =
  ({props}) =>
  (children) => {
    return html`<ul part="values" class=${ifDefined(props.className)}>
      ${children}
    </ul>`;
  };
