import {ResultListSelectors} from '../../result-list/result-list-selectors';

export const resultPrintableUriComponent = 'atomic-result-printable-uri';
export const ResultPrintableUriSelectors = {
  shadow: () => cy.get(resultPrintableUriComponent).shadow(),
  firstInResult: () =>
    ResultListSelectors.firstResult().find(resultPrintableUriComponent),
};
