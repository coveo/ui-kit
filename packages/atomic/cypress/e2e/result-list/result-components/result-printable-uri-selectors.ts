import {ResultListSelectors} from '../../result-list/result-list-selectors';

export const resultPrintableUriComponent = 'atomic-result-printable-uri';
export const ResultPrintableUriSelectors = {
  shadow: () => cy.get(resultPrintableUriComponent).shadow(),
  firstInResult: () =>
    ResultListSelectors.firstResult().find(resultPrintableUriComponent),
  uriList: () => ResultPrintableUriSelectors.firstInResult().find('ul'),

  uriListElements: () => ResultPrintableUriSelectors.uriList().find('li'),

  links: () => ResultPrintableUriSelectors.firstInResult().find('a'),

  ellipsisButton: () =>
    ResultPrintableUriSelectors.firstInResult().find('button'),
};
