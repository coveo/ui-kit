import {ResultListSelectors} from '../result-list-selectors';

export const resultTimespanComponent = 'atomic-result-timespan';

export const ResultTimespanSelectors = {
  shadow: () => cy.get(resultTimespanComponent),
  firstInResult: () =>
    ResultListSelectors.firstResult().find(resultTimespanComponent),
};
