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
    <div class="dropdown-area hidden border-b pb-1">
      <select
        class="btn-text-primary cursor-pointer py-2 text-xl font-bold"
        onChange={(e) =>
          props.onTabChange((e.target as HTMLSelectElement).value)
        }
      >
        {children}
      </select>
    </div>
  );
};
