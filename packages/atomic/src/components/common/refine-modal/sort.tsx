import {Fragment, FunctionalComponent, h} from '@stencil/core';
import {i18n} from 'i18next';
import SortIcon from '../../../images/sort.svg';

interface RefineModalSortSectionProps {
  i18n: i18n;
  onSelect: (e: Event) => void;
}
export const RefineModalSortSection: FunctionalComponent<
  RefineModalSortSectionProps
> = ({i18n, onSelect}, children) => {
  return (
    <Fragment>
      <h1
        part="section-title section-sort-title"
        class="text-2xl font-bold truncate mb-3"
      >
        {i18n.t('sort')}
      </h1>
      <div part="select-wrapper" class="relative">
        <select
          class="btn-outline-neutral w-full cursor-pointer text-lg font-bold grow appearance-none rounded-lg px-6 py-5"
          part="select"
          aria-label={i18n.t('sort-by')}
          onChange={onSelect}
        >
          {children}
        </select>
        <div
          part="select-icon-wrapper"
          class="absolute pointer-events-none top-0 bottom-0 right-0 flex justify-center items-center pr-6"
        >
          <atomic-icon
            part="select-icon"
            icon={SortIcon}
            class="w-6 h-6"
          ></atomic-icon>
        </div>
      </div>
    </Fragment>
  );
};
