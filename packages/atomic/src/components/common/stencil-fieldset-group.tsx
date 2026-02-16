import {h, FunctionalComponent} from '@stencil/core';

interface GroupProps {
  label: string;
}

/**
 * @deprecated should only be used for Stencil components.
 */
export const FieldsetGroup: FunctionalComponent<GroupProps> = (
  {label},
  children
) => (
  <fieldset class="contents">
    <legend class="sr-only">{label}</legend>
    {children}
  </fieldset>
);
