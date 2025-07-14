import {html} from 'lit';
import type {FunctionalComponentWithChildren} from '@/src/utils/functional-component-utils';

export interface GroupProps {
  label: string;
}

export const renderFieldsetGroup: FunctionalComponentWithChildren<GroupProps> =
  ({props: {label}}) =>
  (children) =>
    html`<fieldset class="contents">
      <legend class="sr-only">${label}</legend>
      ${children}
    </fieldset>`;
