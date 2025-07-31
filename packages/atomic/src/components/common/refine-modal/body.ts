import {html} from 'lit';
import type {FunctionalComponentWithChildrenNoProps} from '@/src/utils/functional-component-utils';

export const renderRefineModalBody: FunctionalComponentWithChildrenNoProps =
  () => (children) =>
    html`
      <aside
        part="content"
        slot="body"
        class="flex w-full flex-col"
      >
        ${children}
      </aside>
    `;
