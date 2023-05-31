import {ResultListSelectors} from '../result-list-selectors';

export const resultTextComponent = 'atomic-result-text';

export const ResultTextSelectors = {
  shadow: () => cy.get(resultTextComponent),
  firstInResult: () =>
    ResultListSelectors.firstResult().find(resultTextComponent),
  highlight: () => ResultTextSelectors.firstInResult().find('b'),
};
