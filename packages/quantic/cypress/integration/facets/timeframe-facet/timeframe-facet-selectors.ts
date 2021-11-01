import {ComponentSelector, CypressSelector} from '../../common-selectors';
import {
  BaseFacetSelector,
  FacetWithValuesSelector,
} from '../facet-common-selectors';

export const timeframeFacetComponent = 'c-quantic-timeframe-facet';

export type TimeframeFacetSelector = BaseFacetSelector &
  FacetWithValuesSelector &
  WithDateRangeSelector;

export interface WithDateRangeSelector extends ComponentSelector {
  startInput: () => CypressSelector;
  endInput: () => CypressSelector;
  applyButton: () => CypressSelector;
}

export const TimeframeFacetSelectors: TimeframeFacetSelector = {
  get: () => cy.get(timeframeFacetComponent),

  label: () => TimeframeFacetSelectors.get().find('header h2 > span'),
  values: () => TimeframeFacetSelectors.get().find('c-quantic-facet-value'),
  clearFilterButton: () =>
    TimeframeFacetSelectors.get().find('.facet__clear-filter'),
  valueLabel: () => TimeframeFacetSelectors.get().find('.facet__value-text'),
  facetValueLabelAtIndex: (index: number) =>
    TimeframeFacetSelectors.valueLabel().eq(index),
  collapseButton: () => TimeframeFacetSelectors.get().find('.facet__collapse'),
  expandButton: () => TimeframeFacetSelectors.get().find('.facet__expand'),
  placeholder: () =>
    TimeframeFacetSelectors.get().find('.placeholder__card-container'),

  selectedCheckbox: () => {
    throw new Error('Selector not supported by the timeframe facet.');
  },
  idleCheckbox: () => {
    throw new Error('Selector not supported by the timeframe facet.');
  },
  selectedValue: () =>
    TimeframeFacetSelectors.get().find(
      '.facet__value-text.facet__value_selected'
    ),

  idleValue: () =>
    TimeframeFacetSelectors.get().find('.facet__value-text.facet__value_idle'),
  checkbox: () => {
    throw new Error('Selector not supported by the timeframe facet.');
  },

  startInput: () =>
    TimeframeFacetSelectors.get().find('.timeframe-facet__start-input input'),
  endInput: () =>
    TimeframeFacetSelectors.get().find('.timeframe-facet__end-input input'),
  applyButton: () =>
    TimeframeFacetSelectors.get().find('.timeframe-facet__apply'),
};
