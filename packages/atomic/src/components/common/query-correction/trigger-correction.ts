import type {i18n} from 'i18next';
import {html} from 'lit';
import {localizedString} from '@/src/directives/localized-string';
import type {FunctionalComponent} from '@/src/utils/functional-component-utils';

type TriggerCorrectionShowingItemsForKey =
  | 'showing-products-for'
  | 'showing-results-for';
interface Props {
  i18n: i18n;
  i18nKeyShowingItemsFor: TriggerCorrectionShowingItemsForKey;
  correctedQuery: string;
  originalQuery: string;
  onClick: () => void;
}

export const renderTriggerCorrection: FunctionalComponent<Props> = ({
  props,
}) => {
  return html`
    <p class="text-on-background text-lg leading-6" part="showing-results-for">
      ${localizedString({
        i18n: props.i18n,
        key: props.i18nKeyShowingItemsFor,
        params: {query: html`<b part="highlight">${props.correctedQuery}</b>`},
      })}
    </p>
    <p class="text-on-background text-base leading-5" part="search-instead-for">
      ${localizedString({
        i18n: props.i18n,
        key: 'search-instead-for',
        params: {
          query: html`<button
            class="text-primary hover:text-primary-light focus-visible:text-primary-light py-1 hover:underline focus-visible:underline"
            part="undo-btn"
            @click=${props.onClick}
          >
            ${props.originalQuery}
          </button>`,
        },
      })}
    </p>
  `;
};
