import {html, type TemplateResult, type nothing} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';

export interface CategoryFacetTreeValueContainerProps {
  isExpandable?: boolean;
  isExpanded?: boolean;
}

export const renderCategoryFacetTreeValueContainer =
  ({props}: {props: CategoryFacetTreeValueContainerProps} = {props: {}}) =>
  (children: TemplateResult | typeof nothing): TemplateResult => {
    const ariaExpanded = props.isExpandable
      ? String(props.isExpanded ?? false)
      : undefined;
    return html`<li
      class="contents"
      role="treeitem"
      aria-expanded=${ifDefined(ariaExpanded)}
    >
      ${children}
    </li>`;
  };
