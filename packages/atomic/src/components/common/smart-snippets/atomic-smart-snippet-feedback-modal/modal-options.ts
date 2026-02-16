import type {i18n} from 'i18next';
import {html} from 'lit';
import type {FunctionalComponentWithChildren} from '@/src/utils/functional-component-utils';

export interface ModalOptionsProps {
  i18n: i18n;
}

export const renderModalOptions: FunctionalComponentWithChildren<
  ModalOptionsProps
> =
  ({props: {i18n}}) =>
  (children) =>
    html`<fieldset>
      <legend part="reason-title" class="text-on-background text-lg font-bold">
        ${i18n.t('smart-snippet-feedback-select-reason')}
      </legend>
      ${children}
    </fieldset>`;
