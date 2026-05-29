import {html} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import type {FunctionalComponentWithChildren} from '@/src/utils/functional-component-utils';

export interface CategoryFacetParentAsTreeContainerProps {
  isTopLevel: boolean;
  className?: string;
  label?: string;
  onFocusIn?: (event: FocusEvent) => void;
  onKeyDown?: (event: KeyboardEvent) => void;
}

export const renderCategoryFacetParentAsTreeContainer: FunctionalComponentWithChildren<
  CategoryFacetParentAsTreeContainerProps
> =
  ({props}) =>
  (children) => {
    const part = props.isTopLevel ? 'parents' : 'sub-parents';
    return html`<ul
      class=${ifDefined(props.className)}
      part=${part}
      role=${props.isTopLevel ? 'tree' : 'group'}
      aria-label=${ifDefined(props.isTopLevel ? props.label : undefined)}
      @focusin=${props.onFocusIn}
      @keydown=${props.onKeyDown}
    >
      ${children}
    </ul>`;
  };
