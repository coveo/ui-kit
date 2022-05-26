import {h, FunctionalComponent} from '@stencil/core';

export interface GroupProps {
  label: string;
}

export const FieldsetGroup: FunctionalComponent<GroupProps> = (
  {label},
  children
) => (
  <fieldset class="contents">
    <legend class="accessibility-only">{label}</legend>
    {children}
  </fieldset>
);
