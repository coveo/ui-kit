import type {FunctionalComponentWithChildrenNoProps} from '@/src/utils/functional-component-utils';
import {html} from 'lit';

export const renderQueryErrorContainer: FunctionalComponentWithChildrenNoProps =
  () => (children) => {
    return html`<div class="p-8 text-center">${children}</div>`;
  };
