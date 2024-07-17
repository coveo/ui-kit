import {FunctionalComponent, h} from '@stencil/core';
import {i18n} from 'i18next';

export interface SortOptionProps {
  value: string;
  selected: boolean;
  i18n: i18n;
  label: string;
}
export const SortOption: FunctionalComponent<SortOptionProps> = ({
  value,
  selected,
  i18n,
  label,
}) => {
  return (
    <option value={value} selected={selected}>
      {i18n.t(label)}
    </option>
  );
};
