import type {i18n} from 'i18next';
import {html} from 'lit';
import {localizedString} from '@/src/directives/localized-string';
import type {FunctionalComponent} from '@/src/utils/functional-component-utils';

interface CorrectionProps {
  i18n: i18n;
  onClick: () => void;
  correctedQuery: string;
}

export const renderCorrection: FunctionalComponent<CorrectionProps> = ({
  props,
}) => {
  return html`
    <p class="text-on-background" part="did-you-mean">
      ${localizedString({
        i18n: props.i18n,
        key: 'did-you-mean',
        params: {
          query: html`<button
            class="text-primary hover:text-primary-light focus-visible:text-primary-light py-1 hover:underline focus-visible:underline"
            part="correction-btn"
            @click=${props.onClick}
          >
            ${props.correctedQuery}
          </button>`,
        },
      })}
    </p>
  `;
};
