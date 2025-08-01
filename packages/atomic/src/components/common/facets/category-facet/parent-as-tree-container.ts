import {html} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import type {FunctionalComponentWithChildren} from '@/src/utils/functional-component-utils';

export interface CategoryFacetParentAsTreeContainerProps {
  isTopLevel: boolean;
  className?: string;
}

export const renderCategoryFacetParentAsTreeContainer: FunctionalComponentWithChildren<
  CategoryFacetParentAsTreeContainerProps
> =
  ({props}) =>
  (children) => {
    const part = props.isTopLevel ? 'parents' : 'sub-parents';
    return html`<ul class=${ifDefined(props.className)} part=${part}>
      ${children}
    </ul>`;
  };
