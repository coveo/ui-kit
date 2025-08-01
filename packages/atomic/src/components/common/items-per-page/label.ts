import {html} from 'lit';
import type {FunctionalComponentWithChildrenNoProps} from '@/src/utils/functional-component-utils';

export const renderLabel: FunctionalComponentWithChildrenNoProps =
  () => (children) =>
    html`
    <span
      part="label"
      class="text-on-background mr-3 self-start text-lg leading-10"
      aria-hidden="true"
    >
      ${children}
    </span>
  `;
