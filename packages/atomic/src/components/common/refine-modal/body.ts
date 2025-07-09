import {html} from 'lit';
import {FunctionalComponentWithChildrenNoProps} from '@/src/utils/functional-component-utils';

export const renderRefineModalBody: FunctionalComponentWithChildrenNoProps =
  () => (children) => {
    return html`
      <aside
        part="content"
        slot="body"
        class="adjust-for-scroll-bar flex w-full flex-col"
      >
        ${children}
      </aside>
    `;
  };
