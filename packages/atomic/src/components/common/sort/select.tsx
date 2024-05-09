import {FunctionalComponent, h} from '@stencil/core';
import {i18n} from 'i18next';
import ArrowBottomIcon from '../../../images/arrow-bottom-rounded.svg';

interface SortSelectProps {
  id: string;
  i18n: i18n;
  onSelect: (opt: Event) => void;
}
export const SortSelect: FunctionalComponent<SortSelectProps> = (
  {i18n, id, onSelect},
  children
) => {
  return (
    <div class="relative" part="select-parent">
      <select
        id={id}
        class="btn-outline-neutral h-10 flex-grow cursor-pointer appearance-none pl-3 pr-24"
        part="select"
        aria-label={i18n.t('sort-by')}
        onChange={(option) => onSelect(option)}
      >
        {children}
      </select>
      <div
        part="select-separator"
        class="w-10 absolute pointer-events-none top-px bottom-px right-0 border-l border-neutral flex justify-center items-center"
      >
        <atomic-icon class="w-2.5" icon={ArrowBottomIcon}></atomic-icon>
      </div>
    </div>
  );
};
