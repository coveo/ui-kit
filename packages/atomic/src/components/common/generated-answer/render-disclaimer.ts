import type {i18n} from 'i18next';
import {html} from 'lit';
import {when} from 'lit/directives/when.js';
import type {FunctionalComponent} from '@/src/utils/functional-component-utils';

export interface RenderDisclaimerProps {
  i18n: i18n;
  isStreaming: boolean;
}

/**
 * Renders the disclaimer text for the generated answer.
 */
export const renderDisclaimer: FunctionalComponent<RenderDisclaimerProps> = ({
  props,
}) => {
  const {i18n, isStreaming} = props;

  return html`${when(
    !isStreaming,
    () => html`
      <div class="text-neutral-dark text-xs/[1rem]">
        <slot name="disclaimer">${i18n.t('generated-answer-disclaimer')}</slot>
      </div>
    `
  )}`;
};
