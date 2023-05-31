import {ResultListSelectors} from '../result-list-selectors';

export const resultLocalizedTextComponent = 'atomic-result-localized-text';

export const ResultLocalizedTextSelectors = {
  shadow: () => cy.get(resultLocalizedTextComponent),
  firstInResult: () =>
    ResultListSelectors.firstResult().find(resultLocalizedTextComponent),
};
