import {ResultListSelectors} from '../result-list-selectors';

export const resultHtmlComponent = 'atomic-result-html';

export const ResultHtmlSelectors = {
  shadow: () => cy.get(resultHtmlComponent),
  firstInResult: () =>
    ResultListSelectors.firstResult().find(resultHtmlComponent),
  atomicHTML: () => ResultHtmlSelectors.firstInResult().find('atomic-html'),
};
