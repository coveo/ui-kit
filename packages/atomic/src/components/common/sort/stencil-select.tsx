import {FunctionalComponent, h} from '@stencil/core';
import {i18n} from 'i18next';
import ArrowBottomIcon from '../../../images/arrow-bottom-rounded.svg';

interface SortSelectProps {
  id: string;
  i18n: i18n;
  onSelect: (opt: Event) => void;
}

/**
 * @deprecated should only be used for Stencil components.
 */
export const SortSelect: FunctionalComponent<SortSelectProps> = (
  {i18n, id, onSelect},
  children
) => {
  return (
    <div class="relative" part="select-parent">
      <select
        id={id}
        class="btn-outline-neutral h-10 grow cursor-pointer appearance-none pr-24 pl-3"
        part="select"
        aria-label={i18n.t('sort-by')}
        onChange={(option) => onSelect(option)}
      >
        {children}
      </select>
      <div
        part="select-separator"
        class="border-neutral pointer-events-none absolute top-px right-0 bottom-px flex w-10 items-center justify-center border-l"
      >
        <atomic-icon class="w-2.5" icon={ArrowBottomIcon}></atomic-icon>
      </div>
    </div>
  );
};
