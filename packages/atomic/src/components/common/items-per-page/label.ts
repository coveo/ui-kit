import {FunctionalComponentWithChildren} from '@/src/utils/functional-component-utils';
import {html} from 'lit';

export const renderLabel: FunctionalComponentWithChildren<{}> =
  () => (children) => html`
    <span
      part="label"
      class="text-on-background mr-3 self-start text-lg leading-10"
      aria-hidden="true"
    >
      ${children}
    </span>
  `;
