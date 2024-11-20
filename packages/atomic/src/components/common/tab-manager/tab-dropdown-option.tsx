import {FunctionalComponent, h} from '@stencil/core';

interface TabDropdownOptionProps {
  value: string;
  label: string;
  isSelected: boolean;
}

export const TabDropdownOption: FunctionalComponent<TabDropdownOptionProps> = (
  props
) => {
  return (
    <option
      class="text-black"
      key={props.value}
      value={props.value}
      selected={props.isSelected}
    >
      {props.label}
    </option>
  );
};
