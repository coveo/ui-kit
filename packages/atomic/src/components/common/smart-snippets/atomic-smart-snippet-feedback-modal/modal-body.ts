import {html} from 'lit';
import type {FunctionalComponentWithChildren} from '@/src/utils/functional-component-utils';

interface ModalBodyProps {
  formId: string;
  onSubmit: (e: Event) => void;
}

export const renderModalBody: FunctionalComponentWithChildren<ModalBodyProps> =
  ({props: {formId, onSubmit}}) =>
  (children) =>
    html`<form
      part="form"
      id=${formId}
      slot="body"
      @submit=${onSubmit}
      class="flex flex-col gap-8"
    >
      ${children}
    </form>`;
