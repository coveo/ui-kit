import {html} from 'lit';
import {when} from 'lit/directives/when.js';
import type {FunctionalComponentWithChildrenNoProps} from '@/src/utils/functional-component-utils';

export const renderChildrenWrapper: FunctionalComponentWithChildrenNoProps =
  () => (children) => {
    const hasChildren =
      Array.isArray(children) ? children.length > 0 : !!children;
    return html`<div part="children-root">
      ${when(hasChildren, () => html`<slot name="before-children"></slot>`)}
      ${children}
      ${when(hasChildren, () => html`<slot name="after-children"></slot>`)}
    </div>`;
  };
