import type {i18n} from 'i18next';
import {html} from 'lit';
import type {FunctionalComponentWithChildren} from '@/src/utils/functional-component-utils';
import ArrowBottomIcon from '../../../images/arrow-bottom-rounded.svg';
import '../atomic-icon/atomic-icon';

export interface SortSelectProps {
  id: string;
  i18n: i18n;
  onSelect: (opt: Event) => void;
}

export const renderSortSelect: FunctionalComponentWithChildren<
  SortSelectProps
> =
  ({props: {i18n, id, onSelect}}) =>
  (children) => {
    return html`
      <div class="relative" part="select-parent">
        <select
          id=${id}
          class="btn-outline-neutral h-10 flex-grow cursor-pointer appearance-none pr-24 pl-3 peer"
          part="select"
          aria-label=${i18n.t('sort-by')}
          @change=${onSelect}
        >
          ${children}
        </select>
        <div
          part="select-separator"
          class="border-neutral peer-hover:border-primary-light peer-focus-within:border-primary-light peer-hover:text-primary-light peer-focus-within:text-primary-light pointer-events-none absolute top-px right-0 bottom-px flex w-10 items-center justify-center border-l"
        >
          <atomic-icon class="w-3" icon=${ArrowBottomIcon}></atomic-icon>
        </div>
      </div>
    `;
  };
