import type {i18n} from 'i18next';
import {html} from 'lit';
import {localizedString} from '@/src/directives/localized-string';
import type {FunctionalComponent} from '@/src/utils/functional-component-utils';

interface AutoCorrectionProps {
  i18n: i18n;
  originalQuery: string;
  correctedTo: string;
}

export const renderAutoCorrection: FunctionalComponent<AutoCorrectionProps> = ({
  props,
}) => {
  return html`
    <p class="text-on-background mb-1" part="no-results">
      ${localizedString({
        i18n: props.i18n,
        key: 'no-results-for-did-you-mean',
        params: {
          query: html`<b part="highlight">${props.originalQuery}</b>`,
        },
      })}
    </p>
    <p class="text-on-background" part="auto-corrected">
      ${localizedString({
        i18n: props.i18n,
        key: 'query-auto-corrected-to',
        params: {
          query: html`<b part="highlight">${props.correctedTo}</b>`,
        },
      })}
    </p>
  `;
};
