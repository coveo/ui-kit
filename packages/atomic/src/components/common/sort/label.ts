import type {i18n} from 'i18next';
import {html} from 'lit';
import type {FunctionalComponent} from '@/src/utils/functional-component-utils';

export interface SortLabelProps {
  id: string;
  i18n: i18n;
}

export const renderSortLabel: FunctionalComponent<SortLabelProps> = ({
  props: {i18n, id},
}) => {
  return html`<label
    class="m-2 cursor-pointer text-sm font-bold"
    part="label"
    for=${id}
  >
    ${i18n.t('with-colon', {
      text: i18n.t('sort-by'),
    })}
  </label> `;
};
