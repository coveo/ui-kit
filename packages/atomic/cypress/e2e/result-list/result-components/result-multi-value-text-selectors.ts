import {ResultListSelectors} from '../result-list-selectors';

export const resultMultiValueTextComponent = 'atomic-result-multi-value-text';

export const ResultMultiValueTextSelectors = {
  shadow: () => cy.get('atomic-result-multi-value-text'),
  value: () =>
    ResultMultiValueTextSelectors.firstInResult().find(
      '[part="result-multi-value-text-value"] slot',
      {includeShadowDom: true}
    ),
  separator: () =>
    ResultMultiValueTextSelectors.firstInResult().find(
      '[part="result-multi-value-text-separator"]',
      {includeShadowDom: true}
    ),
  moreLabel: () =>
    ResultMultiValueTextSelectors.firstInResult().find(
      '[part="result-multi-value-text-value-more"]',
      {includeShadowDom: true}
    ),
  firstInResult: () =>
    ResultListSelectors.firstResult().find(resultMultiValueTextComponent),
};
