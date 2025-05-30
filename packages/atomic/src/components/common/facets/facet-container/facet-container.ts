import {FunctionalComponentWithChildrenNoProps} from '@/src/utils/functional-component-utils';
import {html} from 'lit';

export const renderFacetContainer: FunctionalComponentWithChildrenNoProps =
  () => (children) => html`
    <div
      class="bg-background border-neutral rounded-lg border p-4"
      part="facet"
    >
      ${children}
    </div>
  `;
