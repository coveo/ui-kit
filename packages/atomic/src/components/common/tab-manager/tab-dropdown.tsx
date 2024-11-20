import {FunctionalComponent, h} from '@stencil/core';
import TabsIcon from '../../../images/arrow-bottom-rounded.svg';

export interface TabDropdownProps {
  tabs: Array<{name: string; label: string}>;
  activeTab: string;
  onTabChange: (tabName: string) => void;
  class?: string;
}

export const TabDropdown: FunctionalComponent<TabDropdownProps> = (
  props,
  children
) => {
  return (
    <div
      class={`tab-dropdown-area relative p-1 ${props.class || ''}`}
      aria-label="tab-dropdown-area"
      part="dropdown-area"
    >
      <select
        aria-label="tab-dropdown"
        class="btn-outline-neutral w-full grow cursor-pointer appearance-none truncate rounded-lg py-3 pl-6 pr-10 text-xl font-bold"
        onChange={(e) =>
          props.onTabChange((e.target as HTMLSelectElement).value)
        }
      >
        {children}
      </select>
      <div
        part="select-icon-wrapper"
        class="pointer-events-none absolute bottom-0 right-0 top-0 flex items-center justify-center pr-6"
      >
        <atomic-icon
          part="select-icon"
          icon={TabsIcon}
          class="ml-4 w-3 shrink-0 self-center"
        ></atomic-icon>
      </div>
    </div>
  );
};
