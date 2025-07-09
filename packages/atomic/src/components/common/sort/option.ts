import type {i18n} from 'i18next';
import {html} from 'lit';
import type {FunctionalComponent} from '@/src/utils/functional-component-utils';

export interface SortOptionProps {
  value: string;
  selected: boolean;
  i18n: i18n;
  label: string;
}

export const renderSortOption: FunctionalComponent<SortOptionProps> = ({
  props: {value, selected, i18n, label},
}) => {
  return html`
    <option value=${value} ?selected=${selected}>${i18n.t(label)}</option>
  `;
};
