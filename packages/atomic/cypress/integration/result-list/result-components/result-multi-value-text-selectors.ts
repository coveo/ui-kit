import {ResultListSelectors} from '../result-list-selectors';

export const resultMultiValueTextComponent = 'atomic-result-multi-value-text';

export const ResultMultiValueTextSelectors = {
  value: () =>
    ResultMultiValueTextSelectors.firstInResult()
      .shadow()
      .find('[part="result-multi-value-text-value"] slot'),
  separator: () =>
    ResultMultiValueTextSelectors.firstInResult()
      .shadow()
      .find('[part="result-multi-value-text-separator"]'),
  more: () =>
    ResultMultiValueTextSelectors.firstInResult()
      .shadow()
      .find('[part="result-multi-value-text-value-more"]'),
  firstInResult: () =>
    ResultListSelectors.firstResult().find(resultMultiValueTextComponent),
};
