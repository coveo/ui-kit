import {html} from 'lit';
import type {FunctionalComponentWithChildrenNoProps} from '@/src/utils/functional-component-utils';

export const renderQueryErrorContainer: FunctionalComponentWithChildrenNoProps =
  () => (children) => {
    return html`<div class="p-8 text-center">${children}</div>`;
  };
