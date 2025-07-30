import {html} from 'lit';
import type {FunctionalComponentWithChildrenNoProps} from '@/src/utils/functional-component-utils';

export const renderRefineModalBody: FunctionalComponentWithChildrenNoProps =
  () => (children) => {
    return html`
      <aside
        part="content"
        slot="body"
        class="mr-[calc(-1*(100vw-3rem-100%))] flex w-full flex-col"
      >
        ${children}
      </aside>
    `;
  };
