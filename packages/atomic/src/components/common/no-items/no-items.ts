import type {i18n} from 'i18next';
import {html} from 'lit';
import {localizedString} from '@/src/directives/localized-string';
import type {FunctionalComponent} from '@/src/utils/functional-component-utils';

interface NoItemsProps {
  query: string;
  i18n: i18n;
  i18nKey: 'no-results' | 'no-products';
}

export const renderNoItems: FunctionalComponent<NoItemsProps> = ({props}) => {
  const content = props.query
    ? localizedString({
        i18n: props.i18n,
        key: `${props.i18nKey}-for`,
        params: {
          query: html`<span
            class="inline-block max-w-full overflow-hidden align-bottom font-bold text-ellipsis whitespace-normal"
            part="highlight"
          >
            ${localizedString({
              i18n: props.i18n,
              key: 'between-quotations',
              params: {text: props.query},
            })}
          </span>`,
        },
      })
    : props.i18n.t(props.i18nKey);

  return html`
    <div
      class="my-2 max-w-full text-center text-2xl font-medium"
      part="no-results"
    >
      ${content}
    </div>
  `;
};
