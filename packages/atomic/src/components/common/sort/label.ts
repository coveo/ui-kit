import {i18n} from 'i18next';
import {html, TemplateResult} from 'lit';

interface SortLabelProps {
  id: string;
  i18n: i18n;
}

export const renderSortLabel = ({id, i18n}: SortLabelProps): TemplateResult => {
  return html`
    <label class="m-2 cursor-pointer text-sm font-bold" part="label" for=${id}>
      ${i18n.t('with-colon', {
        text: i18n.t('sort-by'),
      })}
    </label>
  `;
};
