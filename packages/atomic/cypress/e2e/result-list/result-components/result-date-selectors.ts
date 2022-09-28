import {ResultListSelectors} from '../result-list-selectors';

export const resultDateComponent = 'atomic-result-date';

export const ResultDateSelectors = {
  shadow: () => cy.get(resultDateComponent),
  firstInResult: () =>
    ResultListSelectors.firstResult().find(resultDateComponent),
};
