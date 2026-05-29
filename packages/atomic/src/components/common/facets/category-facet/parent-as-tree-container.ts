import {html} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import type {FunctionalComponentWithChildren} from '@/src/utils/functional-component-utils';

export interface CategoryFacetParentAsTreeContainerProps {
  isTopLevel: boolean;
  className?: string;
  label?: string;
}

export const renderCategoryFacetParentAsTreeContainer: FunctionalComponentWithChildren<
  CategoryFacetParentAsTreeContainerProps
> =
  ({props}) =>
  (children) => {
    const part = props.isTopLevel ? 'parents' : 'sub-parents';
    const role = props.isTopLevel ? 'tree' : 'group';
    return html`<ul
      class=${ifDefined(props.className)}
      part=${part}
      role=${role}
      aria-label=${ifDefined(props.label)}
    >
      ${children}
    </ul>`;
  };
