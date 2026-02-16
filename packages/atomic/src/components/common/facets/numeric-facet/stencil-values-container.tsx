import {FunctionalComponent, h} from '@stencil/core';
import {i18n} from 'i18next';
import {FacetValuesGroup} from '../facet-values-group/stencil-facet-values-group';

interface NumericFacetValuesContainerProps {
  i18n: i18n;
  label: string;
}

/**
 * @deprecated should only be used for Stencil components.
 */
export const NumericFacetValuesContainer: FunctionalComponent<
  NumericFacetValuesContainerProps
> = ({i18n, label}, children) => {
  return (
    <FacetValuesGroup i18n={i18n} label={label}>
      <ul class="mt-3" part="values">
        {children}
      </ul>
    </FacetValuesGroup>
  );
};
