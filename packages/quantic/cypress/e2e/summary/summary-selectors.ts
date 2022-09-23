import {ComponentSelector, CypressSelector} from '../common-selectors';

export const summaryComponent = 'c-quantic-summary';

export interface SummarySelector extends ComponentSelector {
  text: () => CypressSelector;
  range: () => CypressSelector;
  total: () => CypressSelector;
  query: () => CypressSelector;
}

export const SummarySelectors: SummarySelector = {
  get: () => cy.get(summaryComponent),

  text: () =>
    SummarySelectors.get().find('.slds-rich-text-editor__output span'),
  range: () => SummarySelectors.text().find('.summary__range'),
  total: () => SummarySelectors.text().find('.summary__total'),
  query: () => SummarySelectors.text().find('.summary__query'),
};
