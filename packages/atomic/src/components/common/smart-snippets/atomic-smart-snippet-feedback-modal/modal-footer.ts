import type {i18n} from 'i18next';
import {html} from 'lit';
import {renderButton} from '@/src/components/common/button';
import type {FunctionalComponent} from '@/src/utils/functional-component-utils';

export interface ModalFooterProps {
  formId: string;
  i18n: i18n;
  onClick: (e: MouseEvent) => void;
}

export const renderModalFooter: FunctionalComponent<ModalFooterProps> = ({
  props: {formId, i18n, onClick},
}) =>
  html`<div part="buttons" slot="footer" class="flex justify-end gap-2">
    ${renderButton({
      props: {
        part: 'cancel-button',
        style: 'outline-neutral',

        class: 'text-primary flex justify-center p-2 text-sm leading-4',
        onClick,
      },
    })(html`${i18n.t('cancel')}`)}
    ${renderButton({
      props: {
        part: 'submit-button',
        style: 'primary',
        type: 'submit',
        form: formId,

        class: 'flex justify-center p-2 text-sm leading-4',
      },
    })(html`${i18n.t('feedback-send')}`)}
  </div>`;
