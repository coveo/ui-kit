import {h, FunctionalComponent} from '@stencil/core';
import {i18n} from 'i18next';
import {FieldsetGroup} from '../../common/fieldset-group';

export interface FacetValuesGroupProps {
  i18n: i18n;
  label: string;
  part?: string;
  query?: string;
  classes?: string;
}

export const FacetValuesGroup: FunctionalComponent<FacetValuesGroupProps> = (
  props,
  children
) => {
  const facetDisplayLabel = props.i18n.t(props.label);
  const groupLabel =
    props.query === undefined
      ? props.i18n.t('facet-values', {label: facetDisplayLabel})
      : props.i18n.t('facet-search-results', {
          query: props.query,
          label: facetDisplayLabel,
        });

  return (
    <FieldsetGroup label={groupLabel}>
      <ul class={props.classes ?? ''} part={props.part ?? 'values'}>
        {children}
      </ul>
    </FieldsetGroup>
  );
};
