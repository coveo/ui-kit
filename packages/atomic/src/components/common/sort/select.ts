import {i18n} from 'i18next';
import {html, TemplateResult} from 'lit';
import ArrowBottomIcon from '../../../images/arrow-bottom-rounded.svg';

interface SortSelectProps {
  id: string;
  i18n: i18n;
  onSelect: (opt: Event) => void;
  children: TemplateResult;
}

export const renderSortSelect = ({
  i18n,
  id,
  onSelect,
  children,
}: SortSelectProps): TemplateResult => {
  return html`
    <div class="relative" part="select-parent">
      <select
        id=${id}
        class="btn-outline-neutral h-10 flex-grow cursor-pointer appearance-none pl-3 pr-24"
        part="select"
        aria-label=${i18n.t('sort-by')}
        @change=${onSelect}
      >
        ${children}
      </select>
      <div
        part="select-separator"
        class="border-neutral pointer-events-none absolute bottom-px right-0 top-px flex w-10 items-center justify-center border-l"
      >
        <!-- TODO: ensure src works as expected with svg -->
        <img class="w-2.5" src=${ArrowBottomIcon} alt="Arrow Icon" />
      </div>
    </div>
  `;
};
