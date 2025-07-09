import type {i18n} from 'i18next';
import {html} from 'lit';
import {when} from 'lit/directives/when.js';
import type {FunctionalComponentWithChildren} from '@/src/utils/functional-component-utils';
import {renderFieldsetGroup} from '../../fieldset-group';

export interface FacetValuesGroupProps {
  i18n: i18n;
  label?: string;
  query?: string;
}

export const renderFacetValuesGroup: FunctionalComponentWithChildren<
  FacetValuesGroupProps
> =
  ({props}) =>
  (children) => {
    const label = props.label
      ? props.query === undefined
        ? props.i18n.t('facet-values', {label: props.i18n.t(props.label)})
        : props.i18n.t('facet-search-results', {
            query: props.query,
            label: props.i18n.t(props.label),
          })
      : null;

    return when(
      label,
      () => renderFieldsetGroup({props: {label: label!}})(html`${children}`),
      () => html`${children}`
    );
  };
