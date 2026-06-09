import {html} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import type {FunctionalComponentWithChildren} from '@/src/utils/functional-component-utils';

export interface CategoryFacetChildrenAsTreeContainerProps {
  className?: string;
  isTopLevel?: boolean;
  label?: string;
}

export const renderCategoryFacetChildrenAsTreeContainer: FunctionalComponentWithChildren<
  CategoryFacetChildrenAsTreeContainerProps
> =
  ({props}) =>
  (children) => {
    const role = props.isTopLevel ? 'tree' : 'group';
    return html`<ul
      part="values"
      class=${ifDefined(props.className)}
      role=${role}
      aria-label=${ifDefined(props.label)}
    >
      ${children}
    </ul>`;
  };
