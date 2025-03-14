import {i18n} from 'i18next';
import {html, TemplateResult} from 'lit';

export interface SortOptionProps {
  value: string;
  selected: boolean;
  i18n: i18n;
  label: string;
}

export const renderSortOption = ({
  value,
  selected,
  i18n,
  label,
}: SortOptionProps): TemplateResult => {
  return html`
    <option value=${value} ?selected=${selected}>${i18n.t(label)}</option>
  `;
};
