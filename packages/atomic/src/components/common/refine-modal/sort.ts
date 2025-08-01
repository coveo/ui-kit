import type {i18n} from 'i18next';
import {html} from 'lit';
import type {FunctionalComponentWithChildren} from '@/src/utils/functional-component-utils';
import SortIcon from '../../../images/sort.svg';

interface RefineModalSortSectionProps {
  i18n: i18n;
  onSelect: (e: Event) => void;
}

export const renderRefineModalSortSection: FunctionalComponentWithChildren<
  RefineModalSortSectionProps
> =
  ({props}) =>
  (children) => {
    return html`
      <h2
        part="section-title section-sort-title"
        class="mb-3 truncate text-2xl font-bold"
      >
        ${props.i18n.t('sort')}
      </h2>
      <div part="select-wrapper" class="relative">
        <select
          class="btn-outline-neutral peer w-full grow cursor-pointer appearance-none rounded-lg px-6 py-5 text-lg font-bold"
          part="select"
          aria-label=${props.i18n.t('sort-by')}
          @change=${props.onSelect}
        >
          ${children}
        </select>
        <div
          part="select-icon-wrapper"
          class="peer-hover:text-primary-light peer-focus-within:text-primary-light pointer-events-none absolute top-0 right-0 bottom-0 flex items-center justify-center pr-6"
        >
          <atomic-icon
            part="select-icon"
            icon=${SortIcon}
            class="h-6 w-6"
          ></atomic-icon>
        </div>
      </div>
    `;
  };
