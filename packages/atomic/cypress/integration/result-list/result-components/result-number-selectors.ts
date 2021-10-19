import {ResultListSelectors} from '../result-list-selectors';

export const resultNumberComponent = 'atomic-result-number';

export const ResultNumberSelectors = {
  shadow: () => cy.get(resultNumberComponent),
  firstInResult: () =>
    ResultListSelectors.firstResult().find(resultNumberComponent),
  formats: {
    unitFormat: 'atomic-format-unit',
    currencyFormat: 'atomic-format-currency',
    numberFormat: 'atomic-format-number',
  },
};
