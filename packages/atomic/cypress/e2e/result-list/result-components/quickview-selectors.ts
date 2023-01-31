import {ResultListSelectors} from '../result-list-selectors';

export const quickviewComponent = 'atomic-quickview';

export const QuickviewSelectors = {
  shadow: () => cy.get(quickviewComponent),
  firstInResult: () =>
    ResultListSelectors.firstResult().find(quickviewComponent),
};
