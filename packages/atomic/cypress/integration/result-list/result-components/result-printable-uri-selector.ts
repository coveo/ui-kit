import {ResultListSelectors} from '../../result-list/result-list-selectors';

export const resultPrintableUriComponent = 'atomic-result-printable-uri';
export const ResultPrintableUriSelectors = {
  shadow: () => cy.get(resultPrintableUriComponent).shadow(),
  firstInResult: () =>
    ResultListSelectors.firstResult().find(resultPrintableUriComponent),
  uriList: () =>
    ResultPrintableUriSelectors.firstInResult().find(
      'ul[part="result-printable-uri-list"]'
    ),

  uriListElements: () =>
    ResultPrintableUriSelectors.uriList().find(
      'li[part="result-printable-uri-list-element"]'
    ),

  links: () =>
    ResultPrintableUriSelectors.firstInResult().find(
      'a[part="result-printable-uri-link"]'
    ),

  ellipsisButton: () =>
    ResultPrintableUriSelectors.firstInResult().find(
      'button[part="result-printable-uri-list-ellipsis"]'
    ),
};
