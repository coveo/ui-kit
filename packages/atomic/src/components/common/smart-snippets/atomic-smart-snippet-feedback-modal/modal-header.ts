import type {i18n} from 'i18next';
import {html} from 'lit';
import type {FunctionalComponent} from '@/src/utils/functional-component-utils';

export interface ModalHeaderProps {
  i18n: i18n;
}

export const renderModalHeader: FunctionalComponent<ModalHeaderProps> = ({
  props: {i18n},
}) =>
  html`<h1 slot="header">${i18n.t('smart-snippet-feedback-explain-why')}</h1>`;
