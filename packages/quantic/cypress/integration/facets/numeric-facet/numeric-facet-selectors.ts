import {ComponentSelector, CypressSelector} from '../../common-selectors';
import {
  BaseFacetSelector,
  FacetWithValuesSelector,
} from '../facet-common-selectors';

export const numericFacetComponent = 'c-quantic-numeric-facet';

export interface NumericFacetSelector extends ComponentSelector {
  inputMin: () => CypressSelector;
  inputMax: () => CypressSelector;
  applyButton: () => CypressSelector;
  searchForm: () => CypressSelector;
  inputInvalid: () => CypressSelector;
  helpMessage: () => CypressSelector;
}

export type AllFacetSelectors = BaseFacetSelector &
  FacetWithValuesSelector &
  NumericFacetSelector;

export const NumericFacetSelectors: AllFacetSelectors = {
  get: () => cy.get(numericFacetComponent),
  label: () => NumericFacetSelectors.get().find('header .card__header > span'),
  values: () => NumericFacetSelectors.get().find('c-quantic-facet-value'),
  inputMin: () => NumericFacetSelectors.get().find('.numeric__input-min input'),
  inputMax: () => NumericFacetSelectors.get().find('.numeric__input-max input'),
  applyButton: () => NumericFacetSelectors.get().find('button[type="submit"]'),
  searchForm: () => NumericFacetSelectors.get().find('.facet__search-form'),
  clearFilterButton: () =>
    NumericFacetSelectors.get().find('.facet__clear-filter'),
  valueLabel: () => NumericFacetSelectors.get().find('.facet__value-text'),
  facetValueLabelAtIndex: (index: number) =>
    NumericFacetSelectors.valueLabel().eq(index),
  collapseButton: () =>
    NumericFacetSelectors.get()
      .find('.facet__collapse')
      .find('button.slds-button'),
  expandButton: () => NumericFacetSelectors.get().find('.facet__expand'),
  placeholder: () =>
    NumericFacetSelectors.get().find('.placeholder__card-container'),

  selectedCheckbox: () =>
    NumericFacetSelectors.get().find('input[type="checkbox"]:checked'),
  idleCheckbox: () =>
    NumericFacetSelectors.get().find('input[type="checkbox"]:not(:checked)'),
  selectedValue: () =>
    NumericFacetSelectors.get().find(
      '.facet__value-text.facet__value_selected'
    ),
  idleValue: () =>
    NumericFacetSelectors.get().find('.facet__value-text.facet__value_idle'),
  checkbox: () => NumericFacetSelectors.get().find('.slds-checkbox'),
  inputInvalid: () =>
    NumericFacetSelectors.searchForm().find('input[aria-invalid="true"]'),
  helpMessage: () =>
    NumericFacetSelectors.searchForm().find('div.slds-form-element__help'),
};
