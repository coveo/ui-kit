import {html} from 'lit';
import type {FunctionalComponentWithChildrenNoProps} from '@/src/utils/functional-component-utils';

export const renderFacetContainer: FunctionalComponentWithChildrenNoProps =
  () => (children) =>
    html`
    <div
      class="bg-background border-neutral rounded-lg border p-4"
      part="facet"
    >
      ${children}
    </div>
  `;
