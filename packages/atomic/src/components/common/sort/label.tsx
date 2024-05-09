import {FunctionalComponent, h} from '@stencil/core';
import {i18n} from 'i18next';

interface SortLabelProps {
  id: string;
  i18n: i18n;
}

export const SortLabel: FunctionalComponent<SortLabelProps> = ({id, i18n}) => {
  return (
    <label
      class="m-2 font-bold text-sm cursor-pointer"
      part="label"
      htmlFor={id}
    >
      {i18n.t('with-colon', {
        text: i18n.t('sort-by'),
      })}
    </label>
  );
};
