import type {i18n} from 'i18next';
import {html} from 'lit';
import {when} from 'lit-html/directives/when.js';
import type {FunctionalComponent} from '@/src/utils/functional-component-utils';

export interface RenderGeneratingAnswerLabelProps {
  i18n: i18n;
  isStreaming: boolean;
  collapsible: boolean;
}

/**
 * Renders the "Generating answer..." label shown during streaming when collapsible.
 */
export const renderGeneratingAnswerLabel: FunctionalComponent<
  RenderGeneratingAnswerLabelProps
> = ({props}) => {
  const {i18n, isStreaming, collapsible} = props;

  const canRender = collapsible && isStreaming;

  return html`${when(
    canRender,
    () => html`
      <div
        part="is-generating"
        class="text-primary hidden text-base font-light"
      >
        ${i18n.t('generating-answer')}...
      </div>
    `
  )}`;
};
