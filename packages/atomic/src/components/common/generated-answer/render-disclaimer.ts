import type {i18n} from 'i18next';
import {html} from 'lit';
import type {FunctionalComponent} from '@/src/utils/functional-component-utils';

export interface RenderDisclaimerProps {
  i18n: i18n;
}

/**
 * Renders the disclaimer text for the generated answer.
 */
export const renderDisclaimer: FunctionalComponent<RenderDisclaimerProps> = ({
  props,
}) => {
  const {i18n} = props;

  return html`
    <div class="flex justify-end text-neutral-dark text-xs/[1rem]">
      <slot name="disclaimer">${i18n.t('generated-answer-disclaimer')}</slot>
    </div>
  `;
};
