import {FunctionalComponent, h} from '@stencil/core';

export interface TabDropdownProps {
  tabs: Array<{name: string; label: string}>;
  activeTab: string;
  onTabChange: (tabName: string) => void;
}

export const TabDropdown: FunctionalComponent<TabDropdownProps> = (
  props,
  children
) => {
  return (
    <div class="hidden pb-1 border-b dropdown-area">
      <select
        aria-label="tab-dropdown"
        class="py-2 text-xl font-bold cursor-pointer btn-text-primary"
        onChange={(e) =>
          props.onTabChange((e.target as HTMLSelectElement).value)
        }
      >
        {children}
      </select>
    </div>
  );
};
