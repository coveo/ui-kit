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
        class="mb-3 truncate text-2xl font-bold"
      >
        {i18n.t('sort')}
      </h1>
      <div part="select-wrapper" class="relative">
        <select
          class="btn-outline-neutral w-full grow cursor-pointer appearance-none rounded-lg px-6 py-5 text-lg font-bold"
          part="select"
          aria-label={i18n.t('sort-by')}
          onChange={onSelect}
        >
          {children}
        </select>
        <div
          part="select-icon-wrapper"
          class="pointer-events-none absolute bottom-0 right-0 top-0 flex items-center justify-center pr-6"
        >
          <atomic-icon
            part="select-icon"
            icon={SortIcon}
            class="h-6 w-6"
          ></atomic-icon>
        </div>
      </div>
    </Fragment>
  );
};
