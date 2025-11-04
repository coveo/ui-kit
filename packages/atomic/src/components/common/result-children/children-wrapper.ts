import {html} from 'lit';
import {when} from 'lit/directives/when.js';
import type {FunctionalComponentWithChildren} from '@/src/utils/functional-component-utils';

interface ChildrenWrapperProps {
  hasChildren: boolean;
}

export const renderChildrenWrapper: FunctionalComponentWithChildren<
  ChildrenWrapperProps
> =
  ({props}) =>
  (children) =>
    html`<div part="children-root">
      ${when(props.hasChildren, () => html`<slot name="before-children"></slot>`)}
      ${children}
      ${when(props.hasChildren, () => html`<slot name="after-children"></slot>`)}
    </div>`;
