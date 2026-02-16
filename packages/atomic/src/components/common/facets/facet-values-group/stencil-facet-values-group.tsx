import {h, FunctionalComponent} from '@stencil/core';
import {i18n} from 'i18next';
import {FieldsetGroup} from '../../stencil-fieldset-group';

interface FacetValuesGroupProps {
  i18n: i18n;
  label?: string;
  query?: string;
}

/**
 * @deprecated should only be used for Stencil components.
 */
export const FacetValuesGroup: FunctionalComponent<FacetValuesGroupProps> = (
  props,
  children
) => {
  if (!props.label) {
    return children;
  }
  const facetDisplayLabel = props.i18n.t(props.label);
  const groupLabel =
    props.query === undefined
      ? props.i18n.t('facet-values', {label: facetDisplayLabel})
      : props.i18n.t('facet-search-results', {
          query: props.query,
          label: facetDisplayLabel,
        });

  return <FieldsetGroup label={groupLabel}>{children}</FieldsetGroup>;
};
