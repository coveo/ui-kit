import {FunctionalComponent, h} from '@stencil/core';
import {i18n} from 'i18next';

interface SortOptionProps {
  value: string;
  selected: boolean;
  i18n: i18n;
  label: string;
}

/**
 * @deprecated should only be used for Stencil components.
 */
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
