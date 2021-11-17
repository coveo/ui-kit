import {ComponentSelector, CypressSelector} from '../common-selectors';

export const summaryComponent = 'c-quantic-summary';

export interface SummarytSelector extends ComponentSelector {
  text: () => CypressSelector;
  range: () => CypressSelector;
  total: () => CypressSelector;
  query: () => CypressSelector;
}

export const SummarySelectors: SummarytSelector = {
  get: () => cy.get(summaryComponent),

  text: () =>
    SummarySelectors.get().find('.slds-rich-text-editor__output span'),
  range: () => SummarySelectors.text().find('b').first(),
  total: () => SummarySelectors.text().find('b').eq(1),
  query: () => SummarySelectors.text().find('b').eq(2),
};
