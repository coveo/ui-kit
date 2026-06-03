import type {i18n} from 'i18next';
import {html} from 'lit';
import type {FunctionalComponentWithChildren} from '@/src/utils/functional-component-utils';
import {renderFacetValuesGroup} from '../facet-values-group/facet-values-group';

export interface NumericFacetValuesContainerProps {
  i18n: i18n;
  label: string;
}

export const renderNumericFacetValuesGroup: FunctionalComponentWithChildren<
  NumericFacetValuesContainerProps
> =
  ({props: {i18n, label}}) =>
  (children) =>
    renderFacetValuesGroup({props: {i18n, label}})(
      html`<ul class="mt-3" part="values">
        ${children}
      </ul>`
    );
