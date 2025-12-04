import {ResultListSelectors} from '../result-list-selectors';

export const resultLinkComponent = 'atomic-result-link';

export const ResultLinkSelectors = {
  shadow: () => cy.get(resultLinkComponent),
  firstInResult: () =>
    ResultListSelectors.firstResult().find(resultLinkComponent),
};