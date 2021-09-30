import {ResultListSelectors} from '../result-list-selectors';

export const resultTextComponent = 'atomic-result-text';

export const ResultTextSelectors = {
  firstInResult: () =>
    ResultListSelectors.firstResult().find(resultTextComponent),
  highlight: () =>
    ResultTextSelectors.firstInResult().find('[part="highlight"]'),
};
